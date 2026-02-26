import { FrontendAgeGroup } from './ageGroupUtils';

/**
 * Utility functions for formatting XP values and gamification elements
 */

/**
 * Formats XP numbers with appropriate abbreviations
 * @param xp - The XP amount to format
 * @returns Formatted XP string
 */
export const formatXP = (xp: number): string => {
  if (xp < 1000) {
    return `${xp} XP`;
  }
  
  if (xp < 1000000) {
    const kValue = (xp / 1000).toFixed(1);
    return `${kValue}K XP`;
  }
  
  const mValue = (xp / 1000000).toFixed(1);
  return `${mValue}M XP`;
};

/**
 * Calculates level from total XP
 * @param xp - Total XP amount
 * @returns User level
 */
export const calculateLevel = (xp: number): number => {
  // Level calculation: Level = floor(sqrt(XP / 100))
  // This creates a smooth progression where each level requires more XP
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

/**
 * Calculates XP required for next level
 * @param currentLevel - Current user level
 * @returns XP needed for next level
 */
export const calculateXPForNextLevel = (currentLevel: number): number => {
  // XP required for level n = (n-1)^2 * 100
  return currentLevel * currentLevel * 100;
};

/**
 * Calculates XP progress towards next level
 * @param currentXP - Current XP amount
 * @param currentLevel - Current level
 * @returns Progress percentage (0-100)
 */
export const calculateLevelProgress = (currentXP: number, currentLevel: number): number => {
  const currentLevelXP = calculateXPForNextLevel(currentLevel - 1);
  const nextLevelXP = calculateXPForNextLevel(currentLevel);
  const progressXP = currentXP - currentLevelXP;
  const levelGapXP = nextLevelXP - currentLevelXP;
  
  return Math.min(100, Math.max(0, (progressXP / levelGapXP) * 100));
};

/**
 * Formats time duration in a user-friendly way
 * @param minutes - Duration in minutes
 * @returns Formatted time string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Formats large numbers with appropriate abbreviations
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 1000000) {
    const kValue = (num / 1000).toFixed(1);
    return `${kValue}K`;
  }
  
  const mValue = (num / 1000000).toFixed(1);
  return `${mValue}M`;
};

/**
 * Calculates streak bonus multiplier
 * @param streakDays - Number of consecutive days
 * @returns Multiplier value
 */
export const calculateStreakBonus = (streakDays: number): number => {
  if (streakDays < 3) return 1.0;
  if (streakDays < 7) return 1.1;
  if (streakDays < 14) return 1.2;
  if (streakDays < 30) return 1.3;
  return 1.5;
};

/**
 * Gets level title based on level number
 * @param level - User level
 * @returns Level title string
 */
export const getLevelTitle = (level: number): string => {
  const titles = [
    'Curious Beginner',      // Level 1
    'Code Explorer',         // Level 2
    'Digital Apprentice',    // Level 3
    'Logic Builder',         // Level 4
    'Problem Solver',        // Level 5
    'Creative Coder',        // Level 6
    'Algorithm Artist',      // Level 7
    'Code Architect',        // Level 8
    'Programming Prodigy',   // Level 9
    'Digital Wizard',        // Level 10
    'Code Master',           // Level 11
    'Innovation Expert',     // Level 12
    'Tech Visionary',        // Level 13
    'Coding Genius',         // Level 14
    'Future Developer',      // Level 15
    'Programming Legend'     // Level 16+
  ];
  
  if (level <= 0) return 'New Coder';
  if (level > titles.length) return 'Programming Legend';
  
  return titles[level - 1];
};

/**
 * Formats achievement unlock message
 * @param achievementName - Name of the achievement
 * @param xpReward - XP reward amount
 * @returns Formatted message
 */
export const formatAchievementMessage = (achievementName: string, xpReward: number): string => {
  return `Achievement Unlocked: ${achievementName}! +${formatXP(xpReward)}`;
};

/**
 * Calculates daily XP goal based on user level and age
 * @param level - User level
 * @param ageGroup - User age group
 * @returns Recommended daily XP goal
 */
export const calculateDailyXPGoal = (level: number, ageGroup: FrontendAgeGroup): number => {
  const baseGoal = {
    '4-6': 50,
    '7-10': 100,
    '11-15': 150
  };
  
  const levelMultiplier = 1 + (level - 1) * 0.1;
  return Math.round(baseGoal[ageGroup] * levelMultiplier);
};

/**
 * Gets motivational message based on progress
 * @param progressPercent - Progress percentage
 * @returns Motivational message
 */
export const getMotivationalMessage = (progressPercent: number): string => {
  if (progressPercent >= 100) {
    return "Fantastic! You've completed your goal!";
  }
  if (progressPercent >= 80) {
    return "You're almost there! Keep going!";
  }
  if (progressPercent >= 60) {
    return "Great progress! You're doing amazing!";
  }
  if (progressPercent >= 40) {
    return "You're making good progress!";
  }
  if (progressPercent >= 20) {
    return "Nice start! Keep up the momentum!";
  }
  return "Every expert was once a beginner!";
};
