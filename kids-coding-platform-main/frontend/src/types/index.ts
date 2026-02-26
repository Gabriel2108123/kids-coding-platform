// User and authentication types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin' | 'parent';
  age: number;
  ageGroup: 'young_learners' | 'elementary' | 'advanced';
  xp: number;
  level: number;
  preferences: {
    theme: string;
    mascot?: string;
    language: string;
  };
}

// Game and activity types
export interface GameConfig {
  type: 'click' | 'maze' | 'drawing' | 'platform';
  title: string;
  objects: GameObjects[];
  sounds: GameSound[];
  userCode?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface GameObjects {
  type: 'sprite' | 'background' | 'platform' | 'enemy' | 'item';
  x: number;
  y: number;
  texture: string;
  width?: number;
  height?: number;
  properties?: Record<string, any>;
}

export interface GameSound {
  key: string;
  url: string;
  volume?: number;
  loop?: boolean;
}

// Module and learning types
export interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  xpReward: number;
  prerequisites: string[];
  challenges: Challenge[];
  isLocked: boolean;
  completionRate: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'game' | 'project';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  timeLimit?: number;
  hints: string[];
  solution?: string;
  isCompleted: boolean;
  userProgress: {
    attempts: number;
    bestScore: number;
    timeSpent: number;
    hintsUsed: number;
  };
}

// Project and creation types
export interface Project {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  code: string;
  xml: string;
  gameConfig: GameConfig;
  isPublic: boolean;
  tags: string[];
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl?: string;
}

// Badge and achievement types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'creativity' | 'collaboration' | 'achievement';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: 'xp' | 'challenges_completed' | 'projects_created' | 'time_spent' | 'streak';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  unlockedAt?: Date;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form and input types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  dateOfBirth: Date;
  parentEmail?: string;
}

// Component prop types
export interface BlocklyEditorProps {
  onCodeChange: (code: string, xml: string) => void;
  initialXml?: string;
  readOnly?: boolean;
  toolbox?: string;
  className?: string;
}

export interface PhaserGameEngineProps {
  gameConfig: GameConfig | null;
  className?: string;
  onGameEvent?: (event: string, data: any) => void;
  autoPlay?: boolean;
}

// Tutorial and interactive exercise types
export interface ExerciseStep {
  id: string;
  title: string;
  description: string;
  instruction: string;
  expectedCode?: string;
  expectedXml?: string;
  hints: string[];
  validation: {
    type: 'code_match' | 'output_match' | 'block_count' | 'custom';
    criteria: any;
  };
}

export interface InteractiveExercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  xpReward: number;
  estimatedTime: number;
  steps: ExerciseStep[];
  prerequisites: string[];
  learningObjectives: string[];
}

// Mobile and touch types
export interface TouchGesture {
  type: 'tap' | 'double_tap' | 'swipe' | 'pinch' | 'long_press';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  duration: number;
  pressure?: number;
}

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down';
  velocity: number;
  distance: number;
}

// Analytics and tracking types
export interface UserAnalytics {
  userId: string;
  sessionId: string;
  action: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LearningProgress {
  moduleId: string;
  challengeId?: string;
  progress: number; // 0-100
  timeSpent: number;
  attemptsCount: number;
  hintsUsed: number;
  completedAt?: Date;
  score?: number;
}

// Error handling types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// Theme and styling types
export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    heading: string;
    body: string;
    code: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Export an empty object as default to satisfy module requirements
const defaultExport = {};
export default defaultExport;
