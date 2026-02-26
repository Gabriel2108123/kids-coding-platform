import mongoose from 'mongoose';

// Simple logger fallback if external logger is not available
const logger = {
    info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
    error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args)
};

// Database configuration interface
interface DatabaseConfig {
    uri: string;
    options: mongoose.ConnectOptions;
    retryAttempts: number;
    retryDelay: number;
}

// Enhanced connection options for production
const getConnectionOptions = (): mongoose.ConnectOptions => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
        // Connection settings
        serverSelectionTimeoutMS: 5000, // Reduced timeout for faster feedback
        socketTimeoutMS: 10000,
        family: 4, // Use IPv4, skip trying IPv6
        
        // Connection pool settings for high concurrency
        maxPoolSize: isProduction ? 50 : 5, // Reduced for development
        minPoolSize: isProduction ? 5 : 1,   // Reduced for development
        maxIdleTimeMS: 30000,                // Close connections after 30s of inactivity
        
        // Performance optimizations
        // Note: buffering options are handled automatically by mongoose
        
        // Security and reliability
        retryWrites: true,      // Automatically retry write operations
        w: 'majority',          // Write concern for data safety
        
        // Monitoring and debugging
        heartbeatFrequencyMS: 10000, // Check server status every 10s
        
        // For educational platform - ensure data consistency
        readPreference: 'primary',
        readConcern: { level: 'majority' }
    };
};

// Database configuration
const getDatabaseConfig = (): DatabaseConfig => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kids-coding-platform';
    
    return {
        uri: mongoURI,
        options: getConnectionOptions(),
        retryAttempts: 5,
        retryDelay: 5000 // 5 seconds between retry attempts
    };
};

// Enhanced connection function with retry logic
export const connectToDatabase = async (): Promise<void> => {
    const config = getDatabaseConfig();
    let attempts = 0;
    
    const attemptConnection = async (): Promise<void> => {
        try {
            attempts++;
            logger.info(`Attempting to connect to MongoDB (attempt ${attempts}/${config.retryAttempts})`);
            
            await mongoose.connect(config.uri, config.options);
            
            logger.info('Successfully connected to MongoDB');
            
        } catch (error) {
            logger.error(`MongoDB connection attempt ${attempts} failed:`, error);
            
            if (attempts >= config.retryAttempts) {
                logger.error('All MongoDB connection attempts failed.');
                if (process.env.NODE_ENV === 'production') {
                    process.exit(1);
                } else {
                    logger.warn('Development mode: continuing without database...');
                    throw new Error('Database connection failed');
                }
            }
            
            logger.info(`Retrying connection in ${config.retryDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, config.retryDelay));
            return attemptConnection();
        }
    };
    
    await attemptConnection();
};

// Enhanced event listeners for better monitoring
export const setupDatabaseEventListeners = (): void => {
    // Connection events
    mongoose.connection.on('connected', () => {
        logger.info('MongoDB connection established successfully');
        logger.info(`Connected to database: ${mongoose.connection.name}`);
        logger.info(`Connection ready state: ${mongoose.connection.readyState}`);
    });
    
    mongoose.connection.on('error', (err: Error) => {
        logger.error('MongoDB connection error:', err);
        
        // For critical errors in production, consider alerting
        if (process.env.NODE_ENV === 'production') {
            // Could integrate with monitoring services here
            logger.error('CRITICAL: MongoDB error in production environment');
        }
    });
    
    mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        
        // Attempt to reconnect if not in a shutdown process
        if (!isShuttingDown) {
            logger.info('Attempting to reconnect to MongoDB...');
        }
    });
    
    mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected successfully');
    });
    
    mongoose.connection.on('reconnectFailed', () => {
        logger.error('MongoDB reconnection failed');
    });
    
    // Connection state monitoring
    mongoose.connection.on('fullsetup', () => {
        logger.info('MongoDB replica set connection established');
    });
    
    mongoose.connection.on('all', () => {
        logger.info('MongoDB connection to all servers established');
    });
};

// Graceful shutdown handling
let isShuttingDown = false;

export const gracefulShutdown = async (): Promise<void> => {
    if (isShuttingDown) return;
    
    isShuttingDown = true;
    logger.info('Initiating graceful MongoDB shutdown...');
    
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed successfully');
    } catch (error) {
        logger.error('Error during MongoDB shutdown:', error);
    }
};

// Database health check function
export const checkDatabaseHealth = async (): Promise<boolean> => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return false;
        }
        
        // Perform a simple ping to check connection
        await mongoose.connection.db.admin().ping();
        return true;
        
    } catch (error) {
        logger.error('Database health check failed:', error);
        return false;
    }
};

// Get database statistics for monitoring
export const getDatabaseStats = async (): Promise<any> => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }
        
        const stats = await mongoose.connection.db.stats();
        return {
            collections: stats.collections,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize,
            indexes: stats.indexes,
            indexSize: stats.indexSize,
            objects: stats.objects,
            // Additional stats for educational platform
            connectionState: mongoose.connection.readyState,
            databaseName: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port
        };
        
    } catch (error) {
        logger.error('Failed to get database statistics:', error);
        throw error;
    }
};

// Initialize indexes for better performance
export const initializeIndexes = async (): Promise<void> => {
    try {
        logger.info('Initializing database indexes...');
        
        // User collection indexes
        await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
        await mongoose.connection.collection('users').createIndex({ username: 1 }, { unique: true });
        await mongoose.connection.collection('users').createIndex({ 'settings.privacy.isPublic': 1 });
        await mongoose.connection.collection('users').createIndex({ ageGroup: 1 });
        await mongoose.connection.collection('users').createIndex({ 'progress.totalXP': -1 });
        await mongoose.connection.collection('users').createIndex({ 'progress.currentLevel': -1 });
        await mongoose.connection.collection('users').createIndex({ 'progress.streakDays': -1 });
        await mongoose.connection.collection('users').createIndex({ createdAt: -1 });
        await mongoose.connection.collection('users').createIndex({ lastLoginAt: -1 });
        await mongoose.connection.collection('users').createIndex({ role: 1 });
        
        // Project collection indexes
        await mongoose.connection.collection('projects').createIndex({ createdBy: 1 });
        await mongoose.connection.collection('projects').createIndex({ isPublished: 1 });
        await mongoose.connection.collection('projects').createIndex({ category: 1 });
        await mongoose.connection.collection('projects').createIndex({ difficulty: 1 });
        await mongoose.connection.collection('projects').createIndex({ targetAgeGroup: 1 });
        await mongoose.connection.collection('projects').createIndex({ 'metrics.views': -1 });
        await mongoose.connection.collection('projects').createIndex({ 'metrics.likes': -1 });
        await mongoose.connection.collection('projects').createIndex({ 'metrics.shares': -1 });
        await mongoose.connection.collection('projects').createIndex({ tags: 1 });
        await mongoose.connection.collection('projects').createIndex({ createdAt: -1 });
        await mongoose.connection.collection('projects').createIndex({ isApproved: 1 });
        
        // Challenge collection indexes
        await mongoose.connection.collection('challenges').createIndex({ difficulty: 1 });
        await mongoose.connection.collection('challenges').createIndex({ category: 1 });
        await mongoose.connection.collection('challenges').createIndex({ targetAgeGroup: 1 });
        await mongoose.connection.collection('challenges').createIndex({ isActive: 1 });
        await mongoose.connection.collection('challenges').createIndex({ 'leaderboard.userId': 1 });
        await mongoose.connection.collection('challenges').createIndex({ 'leaderboard.score': -1 });
        await mongoose.connection.collection('challenges').createIndex({ timeLimit: 1 });
        await mongoose.connection.collection('challenges').createIndex({ createdAt: -1 });
        await mongoose.connection.collection('challenges').createIndex({ type: 1 });
        
        // Module collection indexes
        await mongoose.connection.collection('modules').createIndex({ difficulty: 1 });
        await mongoose.connection.collection('modules').createIndex({ category: 1 });
        await mongoose.connection.collection('modules').createIndex({ targetAgeGroup: 1 });
        await mongoose.connection.collection('modules').createIndex({ isPublished: 1 });
        await mongoose.connection.collection('modules').createIndex({ 'lessons.order': 1 });
        await mongoose.connection.collection('modules').createIndex({ prerequisiteModules: 1 });
        await mongoose.connection.collection('modules').createIndex({ createdAt: -1 });
        
        // Badge collection indexes
        await mongoose.connection.collection('badges').createIndex({ category: 1 });
        await mongoose.connection.collection('badges').createIndex({ rarity: 1 });
        await mongoose.connection.collection('badges').createIndex({ targetAgeGroup: 1 });
        await mongoose.connection.collection('badges').createIndex({ isActive: 1 });
        await mongoose.connection.collection('badges').createIndex({ createdBy: 1 });
        await mongoose.connection.collection('badges').createIndex({ createdAt: -1 });
        
        // Game collection indexes (for game builder)
        await mongoose.connection.collection('games').createIndex({ createdBy: 1 });
        await mongoose.connection.collection('games').createIndex({ isPublished: 1 });
        await mongoose.connection.collection('games').createIndex({ category: 1 });
        await mongoose.connection.collection('games').createIndex({ targetAgeGroup: 1 });
        await mongoose.connection.collection('games').createIndex({ 'metrics.plays': -1 });
        await mongoose.connection.collection('games').createIndex({ createdAt: -1 });
        
        // Compound indexes for common queries
        await mongoose.connection.collection('users').createIndex({ ageGroup: 1, 'progress.totalXP': -1 });
        await mongoose.connection.collection('projects').createIndex({ category: 1, difficulty: 1, targetAgeGroup: 1 });
        await mongoose.connection.collection('challenges').createIndex({ category: 1, difficulty: 1, isActive: 1 });
        await mongoose.connection.collection('modules').createIndex({ category: 1, difficulty: 1, isPublished: 1 });
        await mongoose.connection.collection('badges').createIndex({ category: 1, rarity: 1, isActive: 1 });
        
        logger.info('Database indexes initialized successfully');
        
    } catch (error) {
        logger.error('Failed to initialize database indexes:', error);
        // Don't throw error for index creation failures in development
        if (process.env.NODE_ENV === 'production') {
            throw error;
        }
    }
};

// COPPA compliance helper - ensure data handling for children under 13
export const setupChildDataProtection = async (): Promise<void> => {
    try {
        logger.info('Setting up child data protection measures...');
        
        // Create TTL index for temporary data of users under 13
        await mongoose.connection.collection('users').createIndex(
            { 'coppa.parentalConsent': 1, createdAt: 1 },
            { 
                expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
                partialFilterExpression: { 
                    'coppa.requiresParentalConsent': true,
                    'coppa.parentalConsent': false
                }
            }
        );
        
        // Index for data retention compliance
        await mongoose.connection.collection('users').createIndex(
            { 'coppa.dataRetentionDate': 1 },
            { 
                expireAfterSeconds: 0,
                partialFilterExpression: { 'coppa.dataRetentionDate': { $exists: true } }
            }
        );
        
        logger.info('Child data protection measures configured successfully');
        
    } catch (error) {
        logger.error('Failed to setup child data protection:', error);
        if (process.env.NODE_ENV === 'production') {
            throw error;
        }
    }
};

// Educational platform specific monitoring
export const getEducationalPlatformStats = async (): Promise<any> => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }
        
        const [
            userStats,
            projectStats,
            challengeStats,
            moduleStats,
            badgeStats
        ] = await Promise.all([
            // User statistics by age group
            mongoose.connection.collection('users').aggregate([
                { $group: { _id: '$ageGroup', count: { $sum: 1 }, avgXP: { $avg: '$progress.totalXP' } } }
            ]).toArray(),
            
            // Project statistics
            mongoose.connection.collection('projects').aggregate([
                { $group: { _id: '$category', count: { $sum: 1 }, avgViews: { $avg: '$metrics.views' } } }
            ]).toArray(),
            
            // Challenge completion rates
            mongoose.connection.collection('challenges').aggregate([
                { $group: { _id: '$difficulty', count: { $sum: 1 }, avgCompletions: { $avg: { $size: '$completions' } } } }
            ]).toArray(),
            
            // Module progress
            mongoose.connection.collection('modules').aggregate([
                { $group: { _id: '$category', count: { $sum: 1 }, avgLessons: { $avg: { $size: '$lessons' } } } }
            ]).toArray(),
            
            // Badge distribution
            mongoose.connection.collection('badges').aggregate([
                { $group: { _id: '$rarity', count: { $sum: 1 } } }
            ]).toArray()
        ,]);
        
        return {
            usersByAgeGroup: userStats,
            projectsByCategory: projectStats,
            challengesByDifficulty: challengeStats,
            modulesByCategory: moduleStats,
            badgesByRarity: badgeStats,
            timestamp: new Date()
        };
        
    } catch (error) {
        logger.error('Failed to get educational platform statistics:', error);
        throw error;
    }
};

// Setup process event handlers for graceful shutdown
export const setupProcessEventHandlers = (): void => {
    // Handle application termination
    process.on('SIGINT', async () => {
        logger.info('SIGINT received. Starting graceful shutdown...');
        await gracefulShutdown();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received. Starting graceful shutdown...');
        await gracefulShutdown();
        process.exit(0);
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
        logger.error('Uncaught Exception:', error);
        await gracefulShutdown();
        process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        await gracefulShutdown();
        process.exit(1);
    });
};

// Main initialization function
export const initializeDatabase = async (): Promise<void> => {
    try {
        logger.info('Starting database initialization for kids coding platform...');
        
        // Setup event listeners
        setupDatabaseEventListeners();
        
        // Setup process event handlers
        setupProcessEventHandlers();
        
        // Connect to database
        await connectToDatabase();
        
        // Initialize indexes for better performance
        await initializeIndexes();
        
        // Setup child data protection (COPPA compliance)
        await setupChildDataProtection();
        
        logger.info('Database initialization completed successfully');
        
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
};

// Export default configuration
export default {
    connectToDatabase,
    setupDatabaseEventListeners,
    gracefulShutdown,
    checkDatabaseHealth,
    getDatabaseStats,
    getEducationalPlatformStats,
    initializeDatabase
};
