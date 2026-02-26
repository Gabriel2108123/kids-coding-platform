import mongoose, { Document, Schema } from 'mongoose';

// ==========================================
// CHALLENGE COMPLETION INTERFACE
// ==========================================

export interface IChallengeCompletion extends Document {
    challengeId: string;
    userId: string;
    attemptId: string; // Reference to the successful attempt
    completedAt: Date;
    finalScore: number;
    timeToComplete: number; // in seconds
    attemptsCount: number;
    hintsUsed: number;
    xpEarned: number;
    badgesEarned: string[];
    perfectSolution: boolean;
    achievements: {
        firstTry: boolean;
        noHints: boolean;
        fastCompletion: boolean;
        perfectScore: boolean;
    };
}

// ==========================================
// CHALLENGE COMPLETION SCHEMA
// ==========================================

const challengeCompletionSchema = new Schema<IChallengeCompletion>({
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
    attemptId: {
        type: String,
        required: true,
        ref: 'ChallengeAttempt'
    },
    completedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    finalScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    timeToComplete: {
        type: Number,
        required: true,
        min: 0
    },
    attemptsCount: {
        type: Number,
        required: true,
        min: 1
    },
    hintsUsed: {
        type: Number,
        default: 0,
        min: 0
    },
    xpEarned: {
        type: Number,
        required: true,
        min: 0
    },
    badgesEarned: [{
        type: String,
        ref: 'Badge'
    }],
    perfectSolution: {
        type: Boolean,
        default: false
    },
    achievements: {
        firstTry: {
            type: Boolean,
            default: false
        },
        noHints: {
            type: Boolean,
            default: false
        },
        fastCompletion: {
            type: Boolean,
            default: false
        },
        perfectScore: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true,
    collection: 'challengeCompletions'
});

// Compound indexes
challengeCompletionSchema.index({ challengeId: 1, userId: 1 }, { unique: true });
challengeCompletionSchema.index({ userId: 1, completedAt: -1 });
challengeCompletionSchema.index({ challengeId: 1, finalScore: -1 });

export const ChallengeCompletion = mongoose.model<IChallengeCompletion>('ChallengeCompletion', challengeCompletionSchema);
export default ChallengeCompletion;
