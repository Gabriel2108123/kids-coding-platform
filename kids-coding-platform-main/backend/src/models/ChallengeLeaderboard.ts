import mongoose, { Document, Schema } from 'mongoose';

// ==========================================
// CHALLENGE LEADERBOARD INTERFACE
// ==========================================

export interface IChallengeLeaderboard extends Document {
    challengeId: string;
    userId: string;
    username: string;
    score: number;
    completedAt: Date;
    attemptsCount: number;
    timeToComplete: number;
    rank: number;
    seasonId?: string; // For seasonal leaderboards
}

// ==========================================
// CHALLENGE LEADERBOARD SCHEMA
// ==========================================

const challengeLeaderboardSchema = new Schema<IChallengeLeaderboard>({
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
    username: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    completedAt: {
        type: Date,
        required: true,
        index: true
    },
    attemptsCount: {
        type: Number,
        required: true,
        min: 1
    },
    timeToComplete: {
        type: Number,
        required: true,
        min: 0
    },
    rank: {
        type: Number,
        index: true
    },
    seasonId: {
        type: String,
        index: true
    }
}, {
    timestamps: true,
    collection: 'challengeLeaderboards'
});

// Compound indexes
challengeLeaderboardSchema.index({ challengeId: 1, score: -1, completedAt: 1 });
challengeLeaderboardSchema.index({ challengeId: 1, userId: 1 }, { unique: true });
challengeLeaderboardSchema.index({ userId: 1, score: -1 });

export const ChallengeLeaderboard = mongoose.model<IChallengeLeaderboard>('ChallengeLeaderboard', challengeLeaderboardSchema);
export default ChallengeLeaderboard;
