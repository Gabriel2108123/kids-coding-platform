import { FrontendAgeGroup } from '../utils/ageGroupUtils';

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  category: 'fundamentals' | 'games' | 'storytelling' | 'art' | 'music' | 'math' | 'science';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageGroup: FrontendAgeGroup | 'all';
  estimatedTime: number; // in minutes
  prerequisites: string[];
  skills: string[];
  xpReward: number;
  badgeRewards: string[];
  icon: string;
  color: string;
  unlockConditions: {
    level?: number;
    completedModules?: string[];
    badges?: string[];
  };
  lessons: {
    id: string;
    title: string;
    type: 'introduction' | 'video' | 'coding' | 'quiz' | 'project';
    duration: number;
  }[];
  position: {
    x: number;
    y: number;
  };
  connections: string[]; // IDs of connected modules
}

export const modulesData: ModuleData[] = [
  {
    id: 'welcome-to-coding',
    title: 'Welcome to Coding!',
    description: 'Take your first steps into the magical world of programming! Learn what coding is and why it\'s so amazing.',
    category: 'fundamentals',
    difficulty: 'beginner',
    ageGroup: '4-6',
    estimatedTime: 20,
    prerequisites: [],
    skills: ['basic-concepts', 'problem-solving'],
    xpReward: 100,
    badgeRewards: ['first-steps', 'curious-learner'],
    icon: '🌟',
    color: '#FFD700',
    unlockConditions: {},
    lessons: [
      { id: 'intro', title: 'What is Coding?', type: 'introduction', duration: 5 },
      { id: 'video', title: 'Meet Your Code Friends', type: 'video', duration: 8 },
      { id: 'practice', title: 'Your First Commands', type: 'coding', duration: 5 },
      { id: 'quiz', title: 'Test Your Knowledge', type: 'quiz', duration: 2 }
    ],
    position: { x: 100, y: 300 },
    connections: ['sequence-island']
  },

  {
    id: 'sequence-island',
    title: 'Sequence Island',
    description: 'Learn about giving instructions in the right order! Just like following a recipe, coding needs steps in sequence.',
    category: 'fundamentals',
    difficulty: 'beginner',
    ageGroup: '4-6',
    estimatedTime: 25,
    prerequisites: ['welcome-to-coding'],
    skills: ['sequences', 'step-by-step-thinking'],
    xpReward: 150,
    badgeRewards: ['sequence-master'],
    icon: '🏝️',
    color: '#4ECDC4',
    unlockConditions: {
      completedModules: ['welcome-to-coding']
    },
    lessons: [
      { id: 'intro', title: 'Following Instructions', type: 'introduction', duration: 5 },
      { id: 'video', title: 'The Recipe Adventure', type: 'video', duration: 8 },
      { id: 'practice', title: 'Order the Steps', type: 'coding', duration: 10 },
      { id: 'quiz', title: 'Sequence Quiz', type: 'quiz', duration: 2 }
    ],
    position: { x: 250, y: 200 },
    connections: ['loop-mountain', 'pattern-palace']
  },

  {
    id: 'loop-mountain',
    title: 'Loop Mountain',
    description: 'Climb Loop Mountain and discover the power of repetition! Learn how to make your code do things over and over.',
    category: 'fundamentals',
    difficulty: 'beginner',
    ageGroup: '4-6',
    estimatedTime: 30,
    prerequisites: ['sequence-island'],
    skills: ['loops', 'repetition', 'efficiency'],
    xpReward: 200,
    badgeRewards: ['loop-climber', 'repeat-master'],
    icon: '⛰️',
    color: '#45B7D1',
    unlockConditions: {
      completedModules: ['sequence-island']
    },
    lessons: [
      { id: 'intro', title: 'The Power of Repetition', type: 'introduction', duration: 5 },
      { id: 'video', title: 'Dancing Robot', type: 'video', duration: 10 },
      { id: 'practice', title: 'Create Repeating Patterns', type: 'coding', duration: 12 },
      { id: 'quiz', title: 'Loop Challenge', type: 'quiz', duration: 3 }
    ],
    position: { x: 400, y: 150 },
    connections: ['decision-desert', 'function-forest']
  },

  {
    id: 'pattern-palace',
    title: 'Pattern Palace',
    description: 'Explore beautiful patterns and learn how to create amazing designs with code! Discover the art in programming.',
    category: 'art',
    difficulty: 'beginner',
    ageGroup: '4-6',
    estimatedTime: 35,
    prerequisites: ['sequence-island'],
    skills: ['patterns', 'creativity', 'visual-design'],
    xpReward: 180,
    badgeRewards: ['pattern-artist', 'creative-coder'],
    icon: '🏰',
    color: '#E74C3C',
    unlockConditions: {
      completedModules: ['sequence-island']
    },
    lessons: [
      { id: 'intro', title: 'Patterns Everywhere', type: 'introduction', duration: 5 },
      { id: 'video', title: 'The Pattern Princess', type: 'video', duration: 10 },
      { id: 'practice', title: 'Draw Colorful Patterns', type: 'coding', duration: 15 },
      { id: 'quiz', title: 'Pattern Recognition', type: 'quiz', duration: 3 },
      { id: 'project', title: 'Create Your Masterpiece', type: 'project', duration: 2 }
    ],
    position: { x: 300, y: 350 },
    connections: ['art-studio']
  },

  {
    id: 'decision-desert',
    title: 'Decision Desert',
    description: 'Navigate through the Decision Desert and learn how to make choices in your code! Master if-then thinking.',
    category: 'fundamentals',
    difficulty: 'intermediate',
    ageGroup: '7-10',
    estimatedTime: 40,
    prerequisites: ['loop-mountain'],
    skills: ['conditionals', 'decision-making', 'logic'],
    xpReward: 250,
    badgeRewards: ['decision-maker', 'logic-master'],
    icon: '🏜️',
    color: '#F39C12',
    unlockConditions: {
      completedModules: ['loop-mountain'],
      level: 2
    },
    lessons: [
      { id: 'intro', title: 'Making Choices', type: 'introduction', duration: 8 },
      { id: 'video', title: 'The Choice Adventure', type: 'video', duration: 12 },
      { id: 'practice', title: 'If-Then Challenges', type: 'coding', duration: 15 },
      { id: 'quiz', title: 'Logic Puzzle', type: 'quiz', duration: 5 }
    ],
    position: { x: 550, y: 200 },
    connections: ['variable-village']
  },

  {
    id: 'function-forest',
    title: 'Function Forest',
    description: 'Enter the magical Function Forest where you\'ll learn to create your own special commands! Build reusable code.',
    category: 'fundamentals',
    difficulty: 'intermediate',
    ageGroup: '7-10',
    estimatedTime: 45,
    prerequisites: ['loop-mountain'],
    skills: ['functions', 'organization', 'reusability'],
    xpReward: 300,
    badgeRewards: ['function-creator', 'code-organizer'],
    icon: '🌲',
    color: '#27AE60',
    unlockConditions: {
      completedModules: ['loop-mountain'],
      level: 3
    },
    lessons: [
      { id: 'intro', title: 'Creating Commands', type: 'introduction', duration: 8 },
      { id: 'video', title: 'The Function Fairy', type: 'video', duration: 12 },
      { id: 'practice', title: 'Build Your Functions', type: 'coding', duration: 20 },
      { id: 'quiz', title: 'Function Challenge', type: 'quiz', duration: 5 }
    ],
    position: { x: 450, y: 50 },
    connections: ['game-galaxy']
  },

  {
    id: 'variable-village',
    title: 'Variable Village',
    description: 'Visit Variable Village and discover how to store and use information in your programs! Learn about data.',
    category: 'fundamentals',
    difficulty: 'intermediate',
    ageGroup: '7-10',
    estimatedTime: 35,
    prerequisites: ['decision-desert'],
    skills: ['variables', 'data-storage', 'information-handling'],
    xpReward: 280,
    badgeRewards: ['variable-keeper', 'data-manager'],
    icon: '🏘️',
    color: '#9B59B6',
    unlockConditions: {
      completedModules: ['decision-desert']
    },
    lessons: [
      { id: 'intro', title: 'Storing Information', type: 'introduction', duration: 6 },
      { id: 'video', title: 'The Memory Box', type: 'video', duration: 10 },
      { id: 'practice', title: 'Create and Use Variables', type: 'coding', duration: 15 },
      { id: 'quiz', title: 'Variable Quiz', type: 'quiz', duration: 4 }
    ],
    position: { x: 700, y: 250 },
    connections: ['array-archipelago']
  },

  {
    id: 'art-studio',
    title: 'Digital Art Studio',
    description: 'Express your creativity in the Digital Art Studio! Learn to create beautiful artwork using code.',
    category: 'art',
    difficulty: 'intermediate',
    ageGroup: '7-10',
    estimatedTime: 50,
    prerequisites: ['pattern-palace'],
    skills: ['digital-art', 'creativity', 'visual-programming'],
    xpReward: 320,
    badgeRewards: ['digital-artist', 'creative-genius'],
    icon: '🎨',
    color: '#E91E63',
    unlockConditions: {
      completedModules: ['pattern-palace'],
      level: 2
    },
    lessons: [
      { id: 'intro', title: 'Art Meets Code', type: 'introduction', duration: 8 },
      { id: 'video', title: 'The Digital Paintbrush', type: 'video', duration: 12 },
      { id: 'practice', title: 'Paint with Code', type: 'coding', duration: 25 },
      { id: 'project', title: 'Create Your Gallery', type: 'project', duration: 5 }
    ],
    position: { x: 200, y: 500 },
    connections: ['animation-academy']
  },

  {
    id: 'game-galaxy',
    title: 'Game Galaxy',
    description: 'Blast off to Game Galaxy and learn to create your own amazing games! Combine all your coding skills.',
    category: 'games',
    difficulty: 'advanced',
    ageGroup: '11-15',
    estimatedTime: 60,
    prerequisites: ['function-forest', 'variable-village'],
    skills: ['game-development', 'project-planning', 'advanced-logic'],
    xpReward: 500,
    badgeRewards: ['game-developer', 'galactic-coder'],
    icon: '🌌',
    color: '#8E44AD',
    unlockConditions: {
      completedModules: ['function-forest', 'variable-village'],
      level: 5
    },
    lessons: [
      { id: 'intro', title: 'Game Design Basics', type: 'introduction', duration: 10 },
      { id: 'video', title: 'The Game Creator', type: 'video', duration: 15 },
      { id: 'practice', title: 'Build Your First Game', type: 'coding', duration: 30 },
      { id: 'project', title: 'Game Showcase', type: 'project', duration: 5 }
    ],
    position: { x: 600, y: 50 },
    connections: ['ai-adventure']
  },

  {
    id: 'array-archipelago',
    title: 'Array Archipelago',
    description: 'Sail to Array Archipelago and discover how to work with lists and collections of data! Master data structures.',
    category: 'fundamentals',
    difficulty: 'advanced',
    ageGroup: '11-15',
    estimatedTime: 45,
    prerequisites: ['variable-village'],
    skills: ['arrays', 'data-structures', 'list-manipulation'],
    xpReward: 380,
    badgeRewards: ['array-navigator', 'data-explorer'],
    icon: '🏖️',
    color: '#16A085',
    unlockConditions: {
      completedModules: ['variable-village'],
      level: 4
    },
    lessons: [
      { id: 'intro', title: 'Working with Lists', type: 'introduction', duration: 8 },
      { id: 'video', title: 'The Island Collection', type: 'video', duration: 12 },
      { id: 'practice', title: 'Array Adventures', type: 'coding', duration: 20 },
      { id: 'quiz', title: 'Array Challenge', type: 'quiz', duration: 5 }
    ],
    position: { x: 850, y: 300 },
    connections: ['database-dome']
  },

  {
    id: 'animation-academy',
    title: 'Animation Academy',
    description: 'Join the Animation Academy and bring your creations to life! Learn to create moving, interactive animations.',
    category: 'art',
    difficulty: 'advanced',
    ageGroup: '11-15',
    estimatedTime: 55,
    prerequisites: ['art-studio'],
    skills: ['animation', 'timing', 'interactive-design'],
    xpReward: 420,
    badgeRewards: ['animator', 'motion-master'],
    icon: '🎬',
    color: '#FF6B6B',
    unlockConditions: {
      completedModules: ['art-studio'],
      level: 4
    },
    lessons: [
      { id: 'intro', title: 'Bringing Art to Life', type: 'introduction', duration: 10 },
      { id: 'video', title: 'The Animation Magic', type: 'video', duration: 15 },
      { id: 'practice', title: 'Create Moving Art', type: 'coding', duration: 25 },
      { id: 'project', title: 'Interactive Story', type: 'project', duration: 5 }
    ],
    position: { x: 350, y: 650 },
    connections: ['vr-valley']
  },

  {
    id: 'ai-adventure',
    title: 'AI Adventure',
    description: 'Embark on an AI Adventure and discover the fascinating world of artificial intelligence! Create smart programs.',
    category: 'science',
    difficulty: 'advanced',
    ageGroup: '11-15',
    estimatedTime: 70,
    prerequisites: ['game-galaxy'],
    skills: ['artificial-intelligence', 'machine-learning', 'advanced-algorithms'],
    xpReward: 600,
    badgeRewards: ['ai-explorer', 'future-coder'],
    icon: '🤖',
    color: '#3498DB',
    unlockConditions: {
      completedModules: ['game-galaxy'],
      level: 7,
      badges: ['game-developer']
    },
    lessons: [
      { id: 'intro', title: 'What is AI?', type: 'introduction', duration: 12 },
      { id: 'video', title: 'Meet the Robots', type: 'video', duration: 18 },
      { id: 'practice', title: 'Train Your AI', type: 'coding', duration: 35 },
      { id: 'project', title: 'AI Showcase', type: 'project', duration: 5 }
    ],
    position: { x: 750, y: 100 },
    connections: []
  },

  {
    id: 'database-dome',
    title: 'Database Dome',
    description: 'Enter the Database Dome and learn how to organize and manage large amounts of information! Master data management.',
    category: 'fundamentals',
    difficulty: 'advanced',
    ageGroup: '11-15',
    estimatedTime: 50,
    prerequisites: ['array-archipelago'],
    skills: ['databases', 'data-management', 'information-organization'],
    xpReward: 450,
    badgeRewards: ['database-architect', 'info-organizer'],
    icon: '🏛️',
    color: '#34495E',
    unlockConditions: {
      completedModules: ['array-archipelago'],
      level: 6
    },
    lessons: [
      { id: 'intro', title: 'Organizing Information', type: 'introduction', duration: 10 },
      { id: 'video', title: 'The Information Vault', type: 'video', duration: 15 },
      { id: 'practice', title: 'Build Your Database', type: 'coding', duration: 20 },
      { id: 'quiz', title: 'Data Challenge', type: 'quiz', duration: 5 }
    ],
    position: { x: 1000, y: 350 },
    connections: []
  },

  {
    id: 'vr-valley',
    title: 'Virtual Reality Valley',
    description: 'Step into Virtual Reality Valley and create immersive 3D experiences! The future of programming awaits.',
    category: 'science',
    difficulty: 'advanced',
    ageGroup: '11-15',
    estimatedTime: 65,
    prerequisites: ['animation-academy'],
    skills: ['virtual-reality', '3d-programming', 'immersive-design'],
    xpReward: 550,
    badgeRewards: ['vr-pioneer', 'dimension-master'],
    icon: '🥽',
    color: '#9C88FF',
    unlockConditions: {
      completedModules: ['animation-academy'],
      level: 8
    },
    lessons: [
      { id: 'intro', title: 'Welcome to VR', type: 'introduction', duration: 12 },
      { id: 'video', title: 'Building Virtual Worlds', type: 'video', duration: 18 },
      { id: 'practice', title: 'Create VR Experiences', type: 'coding', duration: 30 },
      { id: 'project', title: 'Virtual Showcase', type: 'project', duration: 5 }
    ],
    position: { x: 500, y: 800 },
    connections: []
  }
];

export const getModuleById = (id: string): ModuleData | undefined => {
  return modulesData.find(module => module.id === id);
};

export const getModulesByCategory = (category: string): ModuleData[] => {
  return modulesData.filter(module => module.category === category);
};

export const getModulesByDifficulty = (difficulty: string): ModuleData[] => {
  return modulesData.filter(module => module.difficulty === difficulty);
};

export const getModulesByAgeGroup = (ageGroup: string): ModuleData[] => {
  return modulesData.filter(module => module.ageGroup === ageGroup || module.ageGroup === 'all');
};

export const getUnlockedModules = (userLevel: number, completedModules: string[], userBadges: string[]): ModuleData[] => {
  return modulesData.filter(module => {
    const conditions = module.unlockConditions;
    
    // Check level requirement
    if (conditions.level && userLevel < conditions.level) {
      return false;
    }
    
    // Check completed modules requirement
    if (conditions.completedModules) {
      const hasAllPrerequisites = conditions.completedModules.every(
        prereq => completedModules.includes(prereq)
      );
      if (!hasAllPrerequisites) {
        return false;
      }
    }
    
    // Check badge requirement
    if (conditions.badges) {
      const hasRequiredBadges = conditions.badges.every(
        badge => userBadges.includes(badge)
      );
      if (!hasRequiredBadges) {
        return false;
      }
    }
    
    return true;
  });
};

export default modulesData;
