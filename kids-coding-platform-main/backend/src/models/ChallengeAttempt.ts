import mongoose, { Document, Schema } from 'mongoose';

// ==========================================
// CHALLENGE ATTEMPT INTERFACE
// ==========================================

export interface IChallengeAttempt extends Document {
    challengeId: string;
    userId: string;
    code: {
        blockly?: string;
        javascript?: string;
        python?: string;
    };
    result: {
        success: boolean;
        score: number;
        testCasesPassed: number;
        totalTestCases: number;
        executionTime: number;
        memoryUsed: number;
        errors: string[];
        output: unknown;
    };
    hintsUsed: string[];
    timeSpent: number; // in seconds
    submittedAt: Date;
    ipAddress?: string;
    metadata: {
        attemptNumber: number;
        sessionId?: string;
        userAgent?: string;
    };
}

// ==========================================
// CHALLENGE ATTEMPT SCHEMA
// ==========================================

const challengeAttemptSchema = new Schema<IChallengeAttempt>({
    challengeId: {
        type: String,
        required: true,
        ref: 'Challenge',
        index: true
    },
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true
    },
    code: {
        blockly: String,
        javascript: String,
        python: String
    },
    result: {
        success: {
            type: Boolean,
            required: true
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        testCasesPassed: {
            type: Number,
            required: true,
            min: 0
        },
        totalTestCases: {
            type: Number,
            required: true,
            min: 0
        },
        executionTime: {
            type: Number,
            required: true,
            min: 0
        },
        memoryUsed: {
            type: Number,
            default: 0
        },
        errors: [String],
        output: Schema.Types.Mixed
    },
    hintsUsed: [{
        type: String
    }],
    timeSpent: {
        type: Number,
        required: true,
        min: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    ipAddress: String,
    metadata: {
        attemptNumber: {
            type: Number,
            required: true,
            min: 1
        },
        sessionId: String,
        userAgent: String
    }
}, {
    timestamps: true,
    collection: 'challengeAttempts'
});

// Compound indexes
challengeAttemptSchema.index({ challengeId: 1, userId: 1 });
challengeAttemptSchema.index({ userId: 1, submittedAt: -1 });
challengeAttemptSchema.index({ challengeId: 1, submittedAt: -1 });

export const ChallengeAttempt = mongoose.model<IChallengeAttempt>('ChallengeAttempt', challengeAttemptSchema);
export default ChallengeAttempt;
