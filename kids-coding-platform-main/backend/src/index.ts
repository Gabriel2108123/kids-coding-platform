import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// Import configurations
import prisma from './prisma';

// Import middleware
import { authMiddleware, optionalAuth } from './middleware/authMiddleware';

// Import routes
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import codeExecutionRoutes from './routes/codeExecutionRoutes';
import mascotRoutes from './routes/mascotRoutes';

// Models logic is now handled by Prisma client

// Load environment variables
dotenv.config();

// ==========================================
// EXPRESS APP INITIALIZATION
// ==========================================

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "blob:"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Rate limiting for API protection
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health' || req.path === '/api/health';
    }
});

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: NODE_ENV === 'production' ? 5 : 50, // limit each IP to 5 auth attempts per windowMs in production
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// COPPA compliance rate limiting for children
const coppaLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: NODE_ENV === 'production' ? 300 : 1000, // More restrictive for children
    message: {
        success: false,
        message: 'Usage limit reached for safety. Please take a break and try again later.',
        code: 'COPPA_RATE_LIMIT_EXCEEDED'
    },
    keyGenerator: (req) => {
        // Use user ID for authenticated requests, IP for others
        return req.user?.id || req.ip;
    },
    skip: (req) => {
        // Skip if user doesn't require parental consent or is not authenticated
        const userCoppa = (req.user?.coppa as any) || {};
        return !userCoppa.requiresParentalConsent;
    }
});

app.use(generalLimiter);

// ==========================================
// CORS CONFIGURATION
// ==========================================

const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        const allowedOrigins = [
            'http://localhost:3000', // React dev server
            'http://localhost:3001', // Alternative React dev server
            'http://100.74.199.17:3000', // Development IP address
            'http://192.168.116.216:3000', // Additional IP address
            'http://192.168.4.125:3000', // Current network IP address
            'http://127.0.0.1:3000', // Localhost IP
            'https://kids-coding-platform.com', // Production domain
            'https://www.kids-coding-platform.com' // Production www domain
        ];

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // In development, allow any localhost or local IP
        if (process.env.NODE_ENV === 'development') {
            if (origin.includes('localhost') ||
                origin.includes('127.0.0.1') ||
                origin.includes('100.74.199.17') ||
                origin.includes('192.168.116.216') ||
                origin.includes('192.168.4.125') ||
                origin.includes('192.168.') ||
                origin.includes('10.') ||
                origin.includes('172.')) {
                return callback(null, true);
            }
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['x-total-count', 'x-page-count']
};

app.use(cors(corsOptions));

// ==========================================
// GENERAL MIDDLEWARE
// ==========================================

// Compression for better performance
app.use(compression());

// Cookie parser for authentication
app.use(cookieParser());

// Request logging
if (NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Body parsing with size limits for safety
app.use(express.json({
    limit: '10mb',
    verify: (req: express.Request & { rawBody?: Buffer }, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

// Serve static files (for uploaded content)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// HEALTH CHECK ENDPOINTS
// ==========================================

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        uptime: process.uptime()
    });
});

app.get('/api/health', async (req, res) => {
    try {
        // Check database connection by querying the current time
        const dbCheck = await prisma.$queryRaw`SELECT 1 as result`;
        const isHealthy = !!dbCheck;

        res.status(isHealthy ? 200 : 503).json({
            success: isHealthy,
            message: isHealthy ? 'All systems operational' : 'Database connection issues',
            timestamp: new Date().toISOString(),
            environment: NODE_ENV,
            services: {
                database: {
                    status: isHealthy ? 'connected' : 'disconnected',
                    healthy: isHealthy
                },
                server: {
                    status: 'running',
                    healthy: true,
                    uptime: process.uptime()
                }
            }
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(503).json({
            success: false,
            message: 'Health check failed',
            error: NODE_ENV === 'development' ? errorMessage : 'Internal server error'
        });
    }
});

// ==========================================
// API ROUTES
// ==========================================

// Authentication routes (with stricter rate limiting)
app.use('/api/auth', authLimiter, userRoutes);

// User management routes
app.use('/api/users', optionalAuth, userRoutes);

// Import educational content routes
import badgeRoutes from './routes/badgeRoutes';
import challengeRoutes from './routes/challengeRoutes';
import moduleRoutes from './routes/moduleRoutes';

// Educational content routes
app.use('/api/badges', optionalAuth, badgeRoutes);
app.use('/api/challenges', optionalAuth, challengeRoutes);
app.use('/api/modules', optionalAuth, moduleRoutes);
app.use('/api/projects', optionalAuth, projectRoutes);

// Code execution routes (with additional safety measures)
// app.use('/api/code', authMiddleware, coppaLimiter, codeExecutionRoutes);
app.use('/api/code', authMiddleware, coppaLimiter, codeExecutionRoutes);

// AI Mascot routes (for interactive learning assistance)
app.use('/api/mascot', authMiddleware, mascotRoutes);

// ==========================================
// API DOCUMENTATION
// ==========================================

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Kids Coding Platform API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            authentication: '/api/auth',
            users: '/api/users',
            badges: '/api/badges',
            challenges: '/api/challenges',
            modules: '/api/modules',
            projects: '/api/projects',
            codeExecution: '/api/code',
            health: '/api/health'
        },
        features: [
            'COPPA Compliance',
            'Age-appropriate Content Filtering',
            'Educational Progress Tracking',
            'Safe Social Features',
            'Gamification System',
            'Accessibility Support',
            'Multi-language Support'
        ]
    });
});

// ==========================================
// ROOT ROUTE & NAVIGATION
// ==========================================

// Root route - Welcome page
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Kids Coding Platform API',
        version: '1.0.0',
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        navigation: {
            api: '/api',
            health: '/health',
            documentation: '/api/docs'
        },
        quickStart: {
            healthCheck: `${req.protocol}://${req.get('host')}/health`,
            apiDocs: `${req.protocol}://${req.get('host')}/api`,
            frontend: 'http://localhost:3000'
        }
    });
});

// API info route (duplicate for convenience)
app.get('/info', (req, res) => {
    res.redirect('/api');
});

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================

// 404 handler for unmatched routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        code: 'ROUTE_NOT_FOUND'
    });
});

// Global error handler
interface CustomError extends Error {
    statusCode?: number;
    status?: number;
    code?: number;
    keyPattern?: Record<string, unknown>;
    errors?: Record<string, { message: string }>;
}

app.use((err: CustomError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);

    // CORS errors
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation',
            code: 'CORS_ERROR'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: err.errors ? Object.values(err.errors).map((e: { message: string }) => e.message) : []
        });
    }

    // Cast errors (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid data format',
            code: 'CAST_ERROR'
        });
    }

    // Duplicate key errors
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry found',
            code: 'DUPLICATE_ERROR',
            field: err.keyPattern ? Object.keys(err.keyPattern)[0] : undefined
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token',
            code: 'INVALID_TOKEN'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Authentication token expired',
            code: 'TOKEN_EXPIRED'
        });
    }

    // Rate limit errors
    if (err.status === 429) {
        return res.status(429).json({
            success: false,
            message: err.message || 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED'
        });
    }

    // Default error response
    const statusCode = err.statusCode || err.status || 500;
    const message = NODE_ENV === 'production' ? 'Internal server error' : err.message;

    return res.status(statusCode).json({
        success: false,
        message,
        code: 'INTERNAL_ERROR',
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ==========================================
// DATABASE CONNECTION & SERVER STARTUP
// ==========================================

const startServer = async () => {
    try {
        console.log('🚀 Starting Kids Coding Platform Server...');

        // Try to connect to database
        console.log('📊 Connecting to database (Prisma)...');
        try {
            await prisma.$connect();
            console.log('✅ Database connected successfully via Prisma');
        } catch (dbError) {
            console.log('⚠️ Database connection failed:', dbError);
            if (NODE_ENV === 'production') {
                throw dbError;
            }
        }

        // Start the server
        const HOST = process.env.HOST || '0.0.0.0';
        const server = app.listen(Number(PORT), HOST, () => {
            console.log(`🌟 Server is running on http://${HOST}:${PORT}`);
            console.log(`📚 Environment: ${NODE_ENV}`);
            console.log(`🔍 API Documentation: http://${HOST}:${PORT}/api`);
            console.log(`💚 Health Check: http://${HOST}:${PORT}/health`);
            console.log(`🌐 Network accessible via:`);
            console.log(`   - http://localhost:${PORT}`);
            console.log(`   - http://192.168.4.125:${PORT}`);
            console.log(`   - http://100.74.199.17:${PORT}`);
            console.log(`   - http://192.168.116.216:${PORT}`);
            console.log('🎯 Kids Coding Platform is ready for learning!');
        });

        // Graceful shutdown handling
        const gracefulShutdown = (signal: string) => {
            console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

            server.close(async () => {
                console.log('📡 HTTP server closed');

                try {
                    await prisma.$disconnect();
                    console.log('📊 Database connection (Prisma) closed');
                    console.log('✅ Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Error during shutdown:', error);
                    process.exit(1);
                }
            });

            // Force close after 30 seconds
            setTimeout(() => {
                console.error('⚠️  Forced shutdown after timeout');
                process.exit(1);
            }, 30000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// ==========================================
// START THE SERVER
// ==========================================

startServer();

// Export app for testing purposes
export default app;