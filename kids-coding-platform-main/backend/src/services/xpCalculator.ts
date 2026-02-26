/**
 * XP Calculator Service
 * Handles experience point calculations for various activities in the kids coding platform
 */

// Base XP values for different activities
export const BASE_XP_VALUES = {
    // Learning activities
    LESSON_COMPLETION: 10,
    MODULE_COMPLETION: 50,
    QUIZ_CORRECT_ANSWER: 5,
    FIRST_TIME_MODULE: 25, // Bonus for completing a module for the first time
    
    // Creative activities
    PROJECT_CREATION: 30,
    PROJECT_COMPLETION: 50,
    PROJECT_PUBLISH: 20,
    GAME_CREATION: 40,
    
    // Challenge activities
    CHALLENGE_COMPLETION: 25,
    CHALLENGE_PERFECT_SCORE: 50,
    WEEKLY_CHALLENGE: 75,
    LEADERBOARD_TOP_10: 100,
    LEADERBOARD_TOP_3: 150,
    LEADERBOARD_FIRST: 200,
    
    // Social activities
    PROJECT_LIKE_RECEIVED: 2,
    PROJECT_FORK: 5,
    PROJECT_SHARE: 3,
    HELPING_PEER: 15,
    
    // Consistency bonuses
    DAILY_LOGIN: 5,
    STREAK_MILESTONE: 25, // Per week of streak
    WEEKEND_ACTIVITY: 10,
    
    // Special achievements
    BADGE_EARNED: 20,
    LEVEL_UP: 30,
    FIRST_GAME: 100,
    FIRST_SHARE: 50,
    MENTOR_RECOGNITION: 75
};

// Multipliers based on difficulty
export const DIFFICULTY_MULTIPLIERS = {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0
};

// Age-based multipliers to encourage younger kids
export const AGE_MULTIPLIERS = {
    '4-7': 1.2,    // 20% bonus for youngest group
    '8-10': 1.1,   // 10% bonus for middle group
    '11-15': 1.0   // Standard XP for older group
};

// Streak multipliers
export const STREAK_MULTIPLIERS = {
    1: 1.0,
    3: 1.1,    // 10% bonus after 3 days
    7: 1.2,    // 20% bonus after 1 week
    14: 1.3,   // 30% bonus after 2 weeks
    30: 1.5    // 50% bonus after 1 month
};

/**
 * Calculate XP for lesson completion
 */
export const calculateLessonXP = (
    baseXP: number = BASE_XP_VALUES.LESSON_COMPLETION,
    options: {
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
        ageGroup?: '4-7' | '8-10' | '11-15';
        isFirstTime?: boolean;
        timeSpent?: number; // in minutes
        accuracy?: number; // 0-100
    } = {}
): number => {
    let xp = baseXP;
    
    // Apply difficulty multiplier
    if (options.difficulty) {
        xp *= DIFFICULTY_MULTIPLIERS[options.difficulty];
    }
    
    // Apply age multiplier
    if (options.ageGroup) {
        xp *= AGE_MULTIPLIERS[options.ageGroup];
    }
    
    // First time bonus
    if (options.isFirstTime) {
        xp += BASE_XP_VALUES.FIRST_TIME_MODULE;
    }
    
    // Time bonus (encourage spending time learning)
    if (options.timeSpent && options.timeSpent >= 5) {
        const timeBonus = Math.min(options.timeSpent * 0.5, 10); // Max 10 XP bonus
        xp += timeBonus;
    }
    
    // Accuracy bonus
    if (options.accuracy && options.accuracy >= 80) {
        const accuracyBonus = (options.accuracy - 70) * 0.5; // 0.5 XP per % above 70%
        xp += accuracyBonus;
    }
    
    return Math.round(xp);
};

/**
 * Calculate XP for module completion
 */
export const calculateModuleXP = (
    baseXP: number = BASE_XP_VALUES.MODULE_COMPLETION,
    options: {
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
        ageGroup?: '4-7' | '8-10' | '11-15';
        lessonsCompleted?: number;
        totalTime?: number; // in minutes
        averageAccuracy?: number;
        streakDays?: number;
    } = {}
): number => {
    let xp = baseXP;
    
    // Apply difficulty multiplier
    if (options.difficulty) {
        xp *= DIFFICULTY_MULTIPLIERS[options.difficulty];
    }
    
    // Apply age multiplier
    if (options.ageGroup) {
        xp *= AGE_MULTIPLIERS[options.ageGroup];
    }
    
    // Lesson completion bonus
    if (options.lessonsCompleted) {
        xp += options.lessonsCompleted * 2; // 2 XP per lesson completed
    }
    
    // Time investment bonus
    if (options.totalTime && options.totalTime >= 30) {
        const timeBonus = Math.min(options.totalTime * 0.3, 25); // Max 25 XP bonus
        xp += timeBonus;
    }
    
    // High average accuracy bonus
    if (options.averageAccuracy && options.averageAccuracy >= 90) {
        xp += 20; // Excellence bonus
    }
    
    // Streak bonus
    if (options.streakDays) {
        const streakLevel = Math.min(Math.floor(options.streakDays / 7), 4); // Max 4 weeks
        const streakMultiplier = Object.values(STREAK_MULTIPLIERS)[streakLevel] || 1;
        xp *= streakMultiplier;
    }
    
    return Math.round(xp);
};

/**
 * Calculate XP for project creation and completion
 */
export const calculateProjectXP = (
    activityType: 'creation' | 'completion' | 'publish',
    options: {
        projectType?: 'game' | 'animation' | 'story' | 'puzzle' | 'educational';
        complexity?: 'simple' | 'medium' | 'complex';
        ageGroup?: '4-7' | '8-10' | '11-15';
        linesOfCode?: number;
        assetsUsed?: number;
        timeSpent?: number;
        isOriginal?: boolean;
        isFork?: boolean;
    } = {}
): number => {
    let baseXP: number;
    
    switch (activityType) {
        case 'creation':
            baseXP = BASE_XP_VALUES.PROJECT_CREATION;
            break;
        case 'completion':
            baseXP = BASE_XP_VALUES.PROJECT_COMPLETION;
            break;
        case 'publish':
            baseXP = BASE_XP_VALUES.PROJECT_PUBLISH;
            break;
        default:
            baseXP = BASE_XP_VALUES.PROJECT_CREATION;
    }
    
    let xp = baseXP;
    
    // Project type bonus
    if (options.projectType === 'game') {
        xp += 10; // Games are more complex
    }
    
    // Complexity multiplier
    if (options.complexity) {
        const complexityMultipliers = { simple: 1.0, medium: 1.3, complex: 1.6 };
        xp *= complexityMultipliers[options.complexity];
    }
    
    // Apply age multiplier
    if (options.ageGroup) {
        xp *= AGE_MULTIPLIERS[options.ageGroup];
    }
    
    // Code complexity bonus
    if (options.linesOfCode) {
        const codeBonus = Math.min(options.linesOfCode * 0.1, 20); // Max 20 XP bonus
        xp += codeBonus;
    }
    
    // Asset usage bonus (encourages creativity)
    if (options.assetsUsed) {
        xp += Math.min(options.assetsUsed * 2, 15); // Max 15 XP bonus
    }
    
    // Time investment bonus
    if (options.timeSpent && options.timeSpent >= 20) {
        const timeBonus = Math.min(options.timeSpent * 0.4, 30); // Max 30 XP bonus
        xp += timeBonus;
    }
    
    // Originality bonus
    if (options.isOriginal) {
        xp += 25; // Bonus for original work
    }
    
    // Fork penalty (still rewarded but less)
    if (options.isFork) {
        xp *= 0.7; // 30% reduction for forks
    }
    
    return Math.round(xp);
};

/**
 * Calculate XP for challenge completion
 */
export const calculateChallengeXP = (
    options: {
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
        ageGroup?: '4-7' | '8-10' | '11-15';
        completionTime?: number; // in seconds
        timeLimit?: number; // in seconds
        score?: number; // 0-100
        isWeekly?: boolean;
        leaderboardPosition?: number;
        attempts?: number;
    } = {}
): number => {
    let xp = BASE_XP_VALUES.CHALLENGE_COMPLETION;
    
    // Weekly challenge bonus
    if (options.isWeekly) {
        xp = BASE_XP_VALUES.WEEKLY_CHALLENGE;
    }
    
    // Apply difficulty multiplier
    if (options.difficulty) {
        xp *= DIFFICULTY_MULTIPLIERS[options.difficulty];
    }
    
    // Apply age multiplier
    if (options.ageGroup) {
        xp *= AGE_MULTIPLIERS[options.ageGroup];
    }
    
    // Perfect score bonus
    if (options.score === 100) {
        xp += BASE_XP_VALUES.CHALLENGE_PERFECT_SCORE;
    }
    
    // Speed bonus (completed before half the time limit)
    if (options.completionTime && options.timeLimit) {
        if (options.completionTime <= options.timeLimit * 0.5) {
            xp += 20; // Speed bonus
        }
    }
    
    // Leaderboard position bonus
    if (options.leaderboardPosition) {
        if (options.leaderboardPosition === 1) {
            xp += BASE_XP_VALUES.LEADERBOARD_FIRST;
        } else if (options.leaderboardPosition <= 3) {
            xp += BASE_XP_VALUES.LEADERBOARD_TOP_3;
        } else if (options.leaderboardPosition <= 10) {
            xp += BASE_XP_VALUES.LEADERBOARD_TOP_10;
        }
    }
    
    // First attempt bonus
    if (options.attempts === 1) {
        xp += 10; // Bonus for getting it right on first try
    }
    
    return Math.round(xp);
};

/**
 * Calculate daily activity XP with streak bonuses
 */
export const calculateDailyActivityXP = (
    streakDays: number,
    activitiesCompleted: number = 1
): number => {
    let xp = BASE_XP_VALUES.DAILY_LOGIN;
    
    // Apply streak multiplier
    const streakLevel = Math.min(streakDays, 30);
    let multiplier = 1.0;
    
    if (streakLevel >= 30) multiplier = STREAK_MULTIPLIERS[30];
    else if (streakLevel >= 14) multiplier = STREAK_MULTIPLIERS[14];
    else if (streakLevel >= 7) multiplier = STREAK_MULTIPLIERS[7];
    else if (streakLevel >= 3) multiplier = STREAK_MULTIPLIERS[3];
    
    xp *= multiplier;
    
    // Activity completion bonus
    xp += (activitiesCompleted - 1) * 3; // 3 XP per additional activity
    
    // Milestone bonuses
    if (streakDays > 0 && streakDays % 7 === 0) {
        xp += BASE_XP_VALUES.STREAK_MILESTONE; // Weekly milestone
    }
    
    return Math.round(xp);
};

/**
 * Calculate level from total XP
 */
export const calculateLevel = (totalXP: number): number => {
    // Progressive XP requirements: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 250 XP, etc.
    let level = 1;
    let xpNeeded = 0;
    
    while (totalXP >= xpNeeded) {
        level++;
        xpNeeded += (level - 1) * 100 + (level - 1) * (level - 2) * 25;
    }
    
    return level - 1; // Return the completed level
};

/**
 * Calculate XP needed for next level
 */
export const calculateXPForNextLevel = (currentXP: number): number => {
    const currentLevel = calculateLevel(currentXP);
    const nextLevel = currentLevel + 1;
    
    // Calculate total XP needed for next level
    let totalXPNeeded = 0;
    for (let i = 2; i <= nextLevel; i++) {
        totalXPNeeded += (i - 1) * 100 + (i - 1) * (i - 2) * 25;
    }
    
    return totalXPNeeded - currentXP;
};

/**
 * Main XP calculation dispatcher
 */
export const calculateXP = (
    activityType: string,
    options: any = {}
): { xp: number; breakdown: string[]; level?: number; levelProgress?: number } => {
    let xp = 0;
    const breakdown: string[] = [];
    
    switch (activityType) {
        case 'lesson_completion':
            xp = calculateLessonXP(undefined, options);
            breakdown.push(`Base lesson XP: ${BASE_XP_VALUES.LESSON_COMPLETION}`);
            break;
            
        case 'module_completion':
            xp = calculateModuleXP(undefined, options);
            breakdown.push(`Base module XP: ${BASE_XP_VALUES.MODULE_COMPLETION}`);
            break;
            
        case 'project_creation':
        case 'project_completion':
        case 'project_publish':
            xp = calculateProjectXP(activityType.split('_')[1] as any, options);
            breakdown.push(`Base project XP: ${BASE_XP_VALUES.PROJECT_CREATION}`);
            break;
            
        case 'challenge_completion':
            xp = calculateChallengeXP(options);
            breakdown.push(`Base challenge XP: ${BASE_XP_VALUES.CHALLENGE_COMPLETION}`);
            break;
            
        case 'daily_activity':
            xp = calculateDailyActivityXP(options.streakDays || 1, options.activitiesCompleted);
            breakdown.push(`Base daily XP: ${BASE_XP_VALUES.DAILY_LOGIN}`);
            break;
            
        default:
            throw new Error(`Unknown activity type: ${activityType}`);
    }
    
    // Add breakdown details
    if (options.difficulty) {
        const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[options.difficulty as keyof typeof DIFFICULTY_MULTIPLIERS] || 1;
        breakdown.push(`Difficulty multiplier (${options.difficulty}): x${difficultyMultiplier}`);
    }
    
    if (options.ageGroup) {
        const ageMultiplier = AGE_MULTIPLIERS[options.ageGroup as keyof typeof AGE_MULTIPLIERS] || 1;
        breakdown.push(`Age group multiplier (${options.ageGroup}): x${ageMultiplier}`);
    }
    
    if (options.streakDays && options.streakDays > 1) {
        breakdown.push(`Streak bonus (${options.streakDays} days): applied`);
    }
    
    return {
        xp,
        breakdown,
        level: options.currentXP ? calculateLevel(options.currentXP + xp) : undefined,
        levelProgress: options.currentXP ? calculateLevel(options.currentXP + xp) : undefined
    };
};

export default {
    calculateXP,
    calculateLevel,
    calculateXPForNextLevel,
    BASE_XP_VALUES,
    DIFFICULTY_MULTIPLIERS,
    AGE_MULTIPLIERS,
    STREAK_MULTIPLIERS
};