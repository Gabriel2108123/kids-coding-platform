import { Request, Response } from 'express';
import { Challenge, User } from '../models';
import { AuthenticatedRequest } from '../types/express';
import { calculateXP } from '../services/xpCalculator';
import BaseController from './BaseController';

class ChallengeController extends BaseController {

    // ==========================================
    // CORE CHALLENGE OPERATIONS
    // ==========================================

    public createChallenge = async (req: AuthenticatedRequest, res: Response) => {
        try {
            // Only admins and instructors can create challenges
            if (!this.validatePermissions(req, res, ['admin', 'instructor'])) {
                return;
            }

            const {
                title,
                description,
                instructions,
                difficulty,
                category,
                targetAgeGroup,
                timeLimit,
                maxAttempts,
                hints,
                testCases,
                startingCode,
                solution,
                tags,
                xpReward,
                prerequisites,
                isActive = true
            } = req.body;

            // Validate required fields
            if (!this.validateRequiredFields(req, res, ['title', 'description', 'difficulty', 'category', 'targetAgeGroup'])) {
                return;
            }

            // Sanitize inputs
            const sanitizedTitle = this.sanitizeInput(title);
            const sanitizedDescription = this.sanitizeInput(description);

            // Check for duplicate challenge titles
            const existingChallenge = await Challenge.findOne({ title: sanitizedTitle });
            if (existingChallenge) {
                return this.sendError(res, 'Challenge with this title already exists', 400);
            }

            const challenge = new Challenge({
                title: sanitizedTitle,
                description: sanitizedDescription,
                instructions: this.sanitizeInput(instructions),
                difficulty,
                category,
                targetAgeGroup,
                timeLimit,
                maxAttempts,
                hints: hints?.map((hint: string) => this.sanitizeInput(hint)),
                testCases,
                startingCode,
                solution,
                tags: tags?.map((tag: string) => this.sanitizeInput(tag)),
                xpReward,
                prerequisites,
                isActive,
                createdBy: req.user._id,
                slug: this.generateSlug(sanitizedTitle)
            });

            await challenge.save();

            return this.sendSuccess(res, challenge, 'Challenge created successfully', 201);

        } catch (error) {
            return this.handleError(error, res, 'createChallenge', 'Failed to create challenge');
        }
    };

    public getChallenges = async (req: Request, res: Response) => {
        try {
            const {
                category,
                difficulty,
                ageGroup,
                search,
                tags,
                isActive = true,
                sortBy = 'createdAt',
                sortOrder: _sortOrder = 'desc'
            } = req.query;

            const { page, limit, skip } = this.parsePaginationParams(req);
            const sort = this.parseSortParams(req, sortBy as string);

            // Build filter
            interface ChallengeFilter {
                isActive?: boolean;
                category?: string;
                difficulty?: string;
                targetAgeGroup?: { $in: string[] };
                tags?: { $in: string[] };
                $or?: Array<{
                    title?: { $regex: string; $options: string };
                    description?: { $regex: string; $options: string };
                    tags?: { $in: string[] };
                }>;
                [key: string]: unknown;
            }
            
            let filter: ChallengeFilter = { isActive: isActive === 'true' };

            if (category && typeof category === 'string') filter.category = category;
            if (difficulty && typeof difficulty === 'string') filter.difficulty = difficulty;
            if (ageGroup && typeof ageGroup === 'string') filter.targetAgeGroup = { $in: [ageGroup, 'all'] };
            if (tags) {
                const tagArray = Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string') as string[] : [tags as string];
                filter.tags = { $in: tagArray };
            }
            if (search && typeof search === 'string') {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { tags: { $in: [search] } }
                ];
            }

            // Apply content filters for safety
            if (req.query.ageGroup) {
                const contentFilter = this.applyContentFilter(ageGroup as string);
                filter = { ...filter, ...contentFilter };
            }

            const challenges = await Challenge.find(filter)
                .populate('createdBy', 'username displayName')
                .populate('prerequisites', 'title difficulty')
                .sort(sort)
                .limit(limit)
                .skip(skip)
                .select('-solution'); // Don't expose solutions in list view

            const total = await Challenge.countDocuments(filter);

            return this.sendPaginatedResponse(res, challenges, total, page, limit);

        } catch (error) {
            return this.handleError(error, res, 'getChallenges', 'Failed to retrieve challenges');
        }
    };

    public getChallengeById = async (req: Request, res: Response) => {
        try {
            const { challengeId } = req.params;

            const challenge = await Challenge.findById(challengeId)
                .populate('createdBy', 'username displayName')
                .populate('prerequisites', 'title difficulty')
                .select('-solution'); // Don't expose solution unless user is instructor/admin

            if (!challenge) {
                return this.sendError(res, 'Challenge not found', 404);
            }

            // Check if user has appropriate access
            if (req.user && !['admin', 'instructor'].includes(req.user.role)) {
                // Students can't see solutions
                const challengeData = challenge.toObject();
                delete challengeData.solution;
                
                return this.sendSuccess(res, challengeData, 'Challenge retrieved successfully');
            }

            // Get challenge statistics
            const stats = await this.getChallengeStats(challengeId);

            return this.sendSuccess(res, {
                ...challenge.toObject(),
                stats
            }, 'Challenge retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getChallengeById', 'Failed to retrieve challenge');
        }
    };

    public updateChallenge = async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!this.validatePermissions(req, res, ['admin', 'instructor'])) {
                return;
            }

            const { challengeId } = req.params;
            const updates = req.body;

            const challenge = await Challenge.findById(challengeId);
            if (!challenge) {
                return this.sendError(res, 'Challenge not found', 404);
            }

            // Check ownership or admin privileges
            if (!this.checkResourceOwnership(req, challenge.createdBy.toString(), res)) {
                return;
            }

            // Allowed fields to update
            const allowedUpdates = [
                'title', 'description', 'instructions', 'difficulty', 'category',
                'targetAgeGroup', 'timeLimit', 'maxAttempts', 'hints', 'testCases',
                'startingCode', 'solution', 'tags', 'xpReward', 'prerequisites', 'isActive'
            ];

            // Apply updates with sanitization
            Object.keys(updates).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    if (typeof updates[key] === 'string') {
                        challenge[key] = this.sanitizeInput(updates[key]);
                    } else {
                        challenge[key] = updates[key];
                    }
                }
            });

            // Update slug if title changed
            if (updates.title) {
                challenge.slug = this.generateSlug(updates.title);
            }

            challenge.updatedAt = new Date();
            await challenge.save();

            return this.sendSuccess(res, challenge, 'Challenge updated successfully');

        } catch (error) {
            return this.handleError(error, res, 'updateChallenge', 'Failed to update challenge');
        }
    };

    public deleteChallenge = async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!this.validatePermissions(req, res, ['admin'])) {
                return;
            }

            const { challengeId } = req.params;

            const challenge = await Challenge.findById(challengeId);
            if (!challenge) {
                return this.sendError(res, 'Challenge not found', 404);
            }

            // Soft delete - deactivate instead of removing
            challenge.isActive = false;
            challenge.deletedAt = new Date();
            await challenge.save();

            return this.sendSuccess(res, { id: challengeId }, 'Challenge deleted successfully');

        } catch (error) {
            return this.handleError(error, res, 'deleteChallenge', 'Failed to delete challenge');
        }
    };

    // ==========================================
    // CHALLENGE ATTEMPT AND SUBMISSION
    // ==========================================

    public startChallengeAttempt = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { challengeId } = req.params;

            const challenge = await Challenge.findById(challengeId);
            if (!challenge || !challenge.isActive) {
                return this.sendError(res, 'Challenge not found or inactive', 404);
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            // Check age group compatibility
            if (!this.validateAgeGroupAccess(user.ageGroup, challenge.targetAgeGroup, res)) {
                return;
            }

            // Check prerequisites
            if (challenge.prerequisites && challenge.prerequisites.length > 0) {
                const hasPrerequisites = challenge.prerequisites.every(prereq =>
                    user.progress.completedChallenges.some(completed => 
                        completed.toString() === prereq.toString()
                    )
                );
                
                if (!hasPrerequisites) {
                    return this.sendError(res, 'Prerequisites not met for this challenge', 403);
                }
            }

            // Check if user has reached max attempts
            // For now, we'll use a default max attempts since the model might not have this field
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const challengeWithLegacy = challenge as any;
            const maxAttempts = challengeWithLegacy.maxAttempts || 10;
            const userAttempts = challengeWithLegacy.attempts?.filter(
                (attempt: { userId: { toString(): string } }) => attempt.userId.toString() === req.user._id.toString()
            ) || [];

            if (userAttempts.length >= maxAttempts) {
                return this.sendError(res, 'Maximum attempts reached for this challenge', 403);
            }

            // Create new attempt
            const attemptData = {
                userId: req.user._id,
                startedAt: new Date(),
                code: challenge.startingCode || '',
                status: 'in_progress',
                hints_used: [],
                timeSpent: 0
            };

            challenge.attempts.push(attemptData);
            await challenge.save();

            // Prepare response (without solution)
            const challengeForAttempt = {
                id: challenge._id,
                title: challenge.title,
                description: challenge.description,
                instructions: challenge.instructions,
                difficulty: challenge.difficulty,
                category: challenge.category,
                timeLimit: challenge.timeLimit,
                hints: challenge.hints,
                startingCode: challenge.startingCode,
                testCases: challenge.testCases?.map(tc => ({
                    input: tc.input,
                    description: tc.description
                    // Don't include expected output
                })),
                attemptId: challenge.attempts[challenge.attempts.length - 1]._id
            };

            return this.sendSuccess(res, challengeForAttempt, 'Challenge attempt started successfully');

        } catch (error) {
            return this.handleError(error, res, 'startChallengeAttempt', 'Failed to start challenge attempt');
        }
    };

    public submitChallengeAttempt = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { challengeId, attemptId } = req.params;
            const { code, timeSpent } = req.body;

            if (!this.validateRequiredFields(req, res, ['code'])) {
                return;
            }

            const challenge = await Challenge.findById(challengeId);
            if (!challenge) {
                return this.sendError(res, 'Challenge not found', 404);
            }

            const attempt = challenge.attempts?.find(attempt => 
                attempt._id && attempt._id.toString() === attemptId
            );
            if (!attempt || attempt.userId.toString() !== req.user._id.toString()) {
                return this.sendError(res, 'Attempt not found or access denied', 404);
            }

            if (attempt.status !== 'in_progress') {
                return this.sendError(res, 'Attempt already completed', 400);
            }

            // Validate submission (basic code execution simulation)
            const validationResult = await this.validateChallengeCode(code, challenge.testCases);

            // Update attempt
            attempt.code = code;
            attempt.submittedAt = new Date();
            attempt.timeSpent = timeSpent || 0;
            attempt.status = validationResult.passed ? 'completed' : 'failed';
            attempt.score = validationResult.score;
            attempt.testResults = validationResult.results;

            // If challenge completed successfully
            if (validationResult.passed) {
                const user = await User.findById(req.user._id);
                if (user && !user.progress.completedChallenges.some(completed => 
                    completed.toString() === challengeId.toString()
                )) {
                    // Add to completed challenges
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    user.progress.completedChallenges.push(challengeId as any);

                    // Add achievement
                    user.progress.achievements.push({
                        type: 'challenge_completed',
                        challengeId: challengeId as string,
                        earnedAt: new Date(),
                        description: `Completed challenge: ${challenge.title}`
                    });

                    // Award XP
                    const xpResult = calculateXP('challenge', { 
                        baseXP: challenge.xpReward || 20,
                        userAge: user.age 
                    });
                    user.progress.totalXP += xpResult.xp;
                    user.progress.currentLevel = Math.floor(user.progress.totalXP / 100) + 1;

                    await user.save();

                    // Update challenge completion stats
                    challenge.completions.push({
                        userId: req.user._id,
                        completedAt: new Date(),
                        timeSpent: timeSpent || 0,
                        hintsUsed: attempt.hints_used.length
                    });

                    // Update leaderboard
                    const leaderboardEntry = challenge.leaderboard.find(
                        entry => entry.userId.toString() === req.user._id.toString()
                    );

                    if (!leaderboardEntry) {
                        challenge.leaderboard.push({
                            userId: req.user._id,
                            score: validationResult.score,
                            timeSpent: timeSpent || 0,
                            completedAt: new Date()
                        });
                    } else if (validationResult.score > leaderboardEntry.score) {
                        leaderboardEntry.score = validationResult.score;
                        leaderboardEntry.timeSpent = timeSpent || 0;
                        leaderboardEntry.completedAt = new Date();
                    }

                    // Sort leaderboard
                    challenge.leaderboard.sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent);
                }
            }

            await challenge.save();

            return this.sendSuccess(res, {
                attemptId,
                status: attempt.status,
                score: attempt.score,
                passed: validationResult.passed,
                testResults: validationResult.results,
                xpGained: validationResult.passed ? (challenge.xpReward || 20) : 0,
                feedback: this.generateFeedback(validationResult, challenge.difficulty)
            }, 'Challenge submission processed');

        } catch (error) {
            return this.handleError(error, res, 'submitChallengeAttempt', 'Failed to submit challenge attempt');
        }
    };

    public getChallengeHint = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { challengeId, attemptId } = req.params;
            const { hintIndex } = req.body;

            const challenge = await Challenge.findById(challengeId);
            if (!challenge) {
                return this.sendError(res, 'Challenge not found', 404);
            }

            const attempt = challenge.attempts?.find(attempt => 
                attempt._id && attempt._id.toString() === attemptId
            );
            if (!attempt || attempt.userId.toString() !== req.user._id.toString()) {
                return this.sendError(res, 'Attempt not found or access denied', 404);
            }

            if (hintIndex >= challenge.hints.length) {
                return this.sendError(res, 'Hint not available', 404);
            }

            // Check if hint already used
            if (attempt.hints_used.includes(hintIndex)) {
                return this.sendError(res, 'Hint already used', 400);
            }

            // Add hint to used hints
            attempt.hints_used.push(hintIndex);
            await challenge.save();

            return this.sendSuccess(res, {
                hint: challenge.hints[hintIndex],
                hintsRemaining: challenge.hints.length - attempt.hints_used.length
            }, 'Hint retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getChallengeHint', 'Failed to get hint');
        }
    };

    // ==========================================
    // CHALLENGE ANALYTICS AND STATS
    // ==========================================

    public getChallengeLeaderboard = async (req: Request, res: Response) => {
        try {
            const { challengeId } = req.params;
            const { limit = 10 } = req.query;

            const challenge = await Challenge.findById(challengeId)
                .populate({
                    path: 'leaderboard.userId',
                    select: 'username displayName avatar ageGroup'
                });

            if (!challenge) {
                return this.sendError(res, 'Challenge not found', 404);
            }

            const leaderboard = challenge.leaderboard
                .slice(0, Number(limit))
                .map((entry, index) => ({
                    rank: index + 1,
                    user: entry.userId,
                    score: entry.score,
                    timeSpent: entry.timeSpent,
                    completedAt: entry.completedAt
                }));

            return this.sendSuccess(res, leaderboard, 'Leaderboard retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getChallengeLeaderboard', 'Failed to get leaderboard');
        }
    };

    public getUserChallengeProgress = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { challengeId } = req.params;

            const challenge = await Challenge.findById(challengeId);
            if (!challenge) {
                return this.sendError(res, 'Challenge not found', 404);
            }

            const userAttempts = challenge.attempts.filter(
                attempt => attempt.userId.toString() === req.user._id.toString()
            );

            const completedChallenge = challenge.completions.find(
                completion => completion.userId.toString() === req.user._id.toString()
            );

            const progress = {
                challengeId,
                attempts: userAttempts.length,
                maxAttempts: challenge.maxAttempts,
                completed: !!completedChallenge,
                bestScore: userAttempts.reduce((max, attempt) => 
                    Math.max(max, attempt.score || 0), 0
                ),
                totalTimeSpent: userAttempts.reduce((total, attempt) => 
                    total + (attempt.timeSpent || 0), 0
                ),
                hintsUsed: userAttempts.reduce((total, attempt) => 
                    total + attempt.hints_used.length, 0
                ),
                lastAttempt: userAttempts.length > 0 ? 
                    userAttempts[userAttempts.length - 1].startedAt : null
            };

            return this.sendSuccess(res, progress, 'User progress retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getUserChallengeProgress', 'Failed to get user progress');
        }
    };

    // ==========================================
    // CHALLENGE DISCOVERY AND FILTERING
    // ==========================================

    public getChallengesByCategory = async (req: Request, res: Response) => {
        try {
            const { category } = req.params;
            const { page, limit, skip } = this.parsePaginationParams(req);

            const filter = {
                category,
                isActive: true
            };

            const challenges = await Challenge.find(filter)
                .populate('createdBy', 'username displayName')
                .sort({ difficulty: 1, createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .select('-solution');

            const total = await Challenge.countDocuments(filter);

            return this.sendPaginatedResponse(res, challenges, total, page, limit);

        } catch (error) {
            return this.handleError(error, res, 'getChallengesByCategory', 'Failed to get challenges by category');
        }
    };

    public getChallengesByDifficulty = async (req: Request, res: Response) => {
        try {
            const { difficulty } = req.params;
            const { page, limit, skip } = this.parsePaginationParams(req);

            const filter = {
                difficulty,
                isActive: true
            };

            const challenges = await Challenge.find(filter)
                .populate('createdBy', 'username displayName')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .select('-solution');

            const total = await Challenge.countDocuments(filter);

            return this.sendPaginatedResponse(res, challenges, total, page, limit);

        } catch (error) {
            return this.handleError(error, res, 'getChallengesByDifficulty', 'Failed to get challenges by difficulty');
        }
    };

    public getRecommendedChallenges = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            // Algorithm for recommendations based on:
            // 1. User's age group
            // 2. Completed challenges
            // 3. Current skill level
            // 4. Learning preferences

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filter: any = {
                isActive: true,
                targetAgeGroup: { $in: [user.ageGroup, 'all'] },
                _id: { $nin: user.progress.completedChallenges }
            };

            // Add difficulty filter based on user level
            const userLevel = user.progress.currentLevel;
            if (userLevel <= 3) filter.difficulty = 'beginner';
            else if (userLevel <= 7) filter.difficulty = { $in: ['beginner', 'intermediate'] };
            // Advanced users can see all difficulties

            const challenges = await Challenge.find(filter)
                .populate('createdBy', 'username displayName')
                .sort({ createdAt: -1 })
                .limit(10)
                .select('-solution');

            return this.sendSuccess(res, challenges, 'Recommended challenges retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getRecommendedChallenges', 'Failed to get recommended challenges');
        }
    };

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private async getChallengeStats(challengeId: string) {
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) return null;

        return {
            totalAttempts: challenge.attempts.length,
            totalCompletions: challenge.completions.length,
            completionRate: challenge.attempts.length > 0 ? 
                (challenge.completions.length / challenge.attempts.length) * 100 : 0,
            averageScore: challenge.leaderboard.length > 0 ?
                challenge.leaderboard.reduce((sum, entry) => sum + entry.score, 0) / challenge.leaderboard.length : 0,
            averageTime: challenge.completions.length > 0 ?
                challenge.completions.reduce((sum, completion) => sum + completion.timeSpent, 0) / challenge.completions.length : 0
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async validateChallengeCode(code: string, testCases: any[]): Promise<any> {
        // This is a simplified validation. In a real implementation, you'd use a secure code execution environment
        try {
            let passedTests = 0;
            const results = [];

            for (const testCase of testCases || []) {
                try {
                    // Simulate test execution
                    const passed = this.simulateTestExecution(code, testCase);
                    if (passed) passedTests++;
                    
                    results.push({
                        input: testCase.input,
                        expected: testCase.expectedOutput,
                        passed,
                        description: testCase.description
                    });
                } catch (error) {
                    results.push({
                        input: testCase.input,
                        expected: testCase.expectedOutput,
                        passed: false,
                        error: 'Runtime error',
                        description: testCase.description
                    });
                }
            }

            const score = testCases.length > 0 ? (passedTests / testCases.length) * 100 : 100;
            const passed = score >= 80; // 80% pass rate required

            return {
                passed,
                score: Math.round(score),
                results,
                totalTests: testCases.length,
                passedTests
            };

        } catch (error) {
            return {
                passed: false,
                score: 0,
                results: [],
                error: 'Code execution failed'
            };
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private simulateTestExecution(_code: string, _testCase: any): boolean {
        // Simplified simulation - in reality, this would execute in a sandboxed environment
        // For now, we'll just do basic validation
        return Math.random() > 0.3; // Simulate 70% pass rate for demo
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private generateFeedback(validationResult: any, _difficulty: string): string {
        if (validationResult.passed) {
            const encouragements = [
                "Excellent work! 🎉",
                "Great job solving this challenge! ⭐",
                "Outstanding! You're getting better! 🚀",
                "Fantastic! Keep up the great work! 💪"
            ];
            return encouragements[Math.floor(Math.random() * encouragements.length)];
        } else {
            const hints = [
                "Don't give up! Try reviewing the instructions again. 💡",
                "Almost there! Check your logic and try again. 🔍",
                "Keep trying! Every attempt makes you stronger! 💪",
                "You're learning! Try using a hint if you need help. 🌟"
            ];
            return hints[Math.floor(Math.random() * hints.length)];
        }
    }
}

// Export controller instance
export default new ChallengeController();

// Export individual methods for route binding
export const {
    createChallenge,
    getChallenges,
    getChallengeById,
    updateChallenge,
    deleteChallenge,
    startChallengeAttempt,
    submitChallengeAttempt,
    getChallengeHint,
    getChallengeLeaderboard,
    getUserChallengeProgress,
    getChallengesByCategory,
    getChallengesByDifficulty,
    getRecommendedChallenges
} = new ChallengeController();