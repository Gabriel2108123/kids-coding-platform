/**
 * Educational Constants and Configuration
 * 
 * This file contains all educational content constants, learning standards,
 * and pedagogical configurations for the Kids Coding Platform.
 */

// ==========================================
// LEARNING STANDARDS AND CURRICULA
// ==========================================

/**
 * Computer Science Education Standards (K-12 Framework)
 * Updated for 3 age categories: 4-6, 7-10, 11-15
 */
export const CS_STANDARDS = {
    // Ages 4-6: Foundational Concepts
    YOUNG_LEARNERS: {
        ageGroup: 'young_learners',
        ageRange: '4-6',
        concepts: [
            'sequence',
            'patterns',
            'cause_and_effect',
            'basic_instructions',
            'following_directions'
        ],
        skills: [
            'drag_and_drop',
            'visual_programming',
            'pattern_recognition',
            'logical_thinking',
            'problem_solving'
        ],
        learningObjectives: [
            'Understand that computers follow instructions',
            'Recognize patterns in daily activities',
            'Create simple sequences of actions',
            'Use technology tools appropriately'
        ]
    },
    
    // Ages 7-10: Basic to Intermediate Programming Concepts
    ELEMENTARY: {
        ageGroup: 'elementary',
        ageRange: '7-10',
        concepts: [
            'algorithms',
            'loops',
            'conditionals',
            'events',
            'variables_basic',
            'debugging',
            'functions',
            'parameters',
            'data_types_basic'
        ],
        skills: [
            'block_programming',
            'logical_reasoning',
            'decomposition',
            'abstraction_basic',
            'testing_and_debugging',
            'text_programming_intro',
            'problem_decomposition',
            'algorithm_design'
        ],
        learningObjectives: [
            'Create programs using loops and conditionals',
            'Understand the concept of variables',
            'Debug simple programs',
            'Recognize algorithmic thinking in daily life',
            'Write simple functions with parameters',
            'Use basic data types effectively',
            'Apply decomposition to solve problems'
        ]
    },
    
    // Ages 11-15: Advanced Programming Concepts
    ADVANCED: {
        ageGroup: 'advanced',
        ageRange: '11-15',
        concepts: [
            'variables_advanced',
            'data_types',
            'arrays_lists',
            'nested_structures',
            'abstraction',
            'object_oriented_programming',
            'recursion',
            'data_structures',
            'algorithms_advanced',
            'software_engineering',
            'databases_basic'
        ],
        skills: [
            'code_organization',
            'collaborative_programming',
            'multiple_languages',
            'code_refactoring',
            'testing_strategies',
            'version_control',
            'project_management'
        ],
        learningObjectives: [
            'Collaborate on programming projects',
            'Understand object-oriented programming principles',
            'Implement common algorithms and data structures',
            'Apply software engineering practices',
            'Create substantial programming projects'
        ]
    }
} as const;

// ==========================================
// DIFFICULTY LEVELS AND PROGRESSION
// ==========================================

/**
 * Difficulty levels with detailed progression criteria
 */
export const DIFFICULTY_LEVELS = {
    BEGINNER: {
        level: 'beginner',
        name: 'Beginner',
        description: 'First steps into coding',
        prerequisites: [],
        estimatedTime: '5-15 minutes',
        characteristics: [
            'Visual/block-based programming',
            'Step-by-step guidance',
            'Immediate feedback',
            'Single concept focus'
        ],
        ageGroups: ['young_learners'] as AgeGroup[]
    },
    
    EASY: {
        level: 'easy',
        name: 'Easy',
        description: 'Building confidence with basic concepts',
        prerequisites: ['basic_sequences', 'pattern_recognition'],
        estimatedTime: '10-20 minutes',
        characteristics: [
            'Combining 2-3 concepts',
            'Guided problem solving',
            'Clear success criteria',
            'Built-in hints available'
        ],
        ageGroups: ['young_learners', 'elementary'] as AgeGroup[]
    },
    
    INTERMEDIATE: {
        level: 'intermediate',
        name: 'Intermediate',
        description: 'Applying knowledge to solve problems',
        prerequisites: ['loops', 'conditionals', 'basic_debugging'],
        estimatedTime: '15-30 minutes',
        characteristics: [
            'Multi-step problem solving',
            'Some independent thinking required',
            'Error handling practice',
            'Code optimization opportunities'
        ],
        ageGroups: ['elementary', 'advanced'] as AgeGroup[]
    },
    
    ADVANCED: {
        level: 'advanced',
        name: 'Advanced',
        description: 'Complex problem solving and creativity',
        prerequisites: ['functions', 'variables', 'advanced_debugging'],
        estimatedTime: '20-45 minutes',
        characteristics: [
            'Open-ended challenges',
            'Multiple solution approaches',
            'Advanced concept integration',
            'Creative expression encouraged'
        ],
        ageGroups: ['elementary', 'advanced'] as AgeGroup[]
    },
    
    EXPERT: {
        level: 'expert',
        name: 'Expert',
        description: 'Master-level challenges and projects',
        prerequisites: ['oop_basics', 'algorithms', 'data_structures'],
        estimatedTime: '30-60 minutes',
        characteristics: [
            'Complex project-based learning',
            'Research and exploration required',
            'Multiple technologies/languages',
            'Real-world application focus'
        ],
        ageGroups: ['advanced'] as AgeGroup[]
    }
};

// ==========================================
// SUBJECT CATEGORIES AND TOPICS
// ==========================================

/**
 * Main subject categories for organizing content
 */
export const SUBJECT_CATEGORIES = {
    VISUAL_PROGRAMMING: {
        id: 'visual_programming',
        name: 'Visual Programming',
        description: 'Block-based and drag-drop programming',
        icon: 'blocks',
        color: '#FF6B6B',
        ageGroups: ['young_learners', 'elementary'] as AgeGroup[],
        subcategories: [
            'scratch_basics',
            'blockly_programming',
            'visual_algorithms',
            'creative_coding'
        ]
    },
    
    TEXT_PROGRAMMING: {
        id: 'text_programming',
        name: 'Text Programming',
        description: 'Traditional code-based programming languages',
        icon: 'code',
        color: '#4ECDC4',
        ageGroups: ['elementary', 'advanced'] as AgeGroup[],
        subcategories: [
            'python_basics',
            'javascript_fundamentals',
            'html_css',
            'programming_languages'
        ]
    },
    
    GAME_DEVELOPMENT: {
        id: 'game_development',
        name: 'Game Development',
        description: 'Creating interactive games and experiences',
        icon: 'gamepad',
        color: '#45B7D1',
        ageGroups: ['elementary', 'advanced'] as AgeGroup[],
        subcategories: [
            'game_mechanics',
            'character_animation',
            'level_design',
            'game_physics'
        ]
    },
    
    WEB_DEVELOPMENT: {
        id: 'web_development',
        name: 'Web Development',
        description: 'Building websites and web applications',
        icon: 'globe',
        color: '#96CEB4',
        ageGroups: ['advanced'] as AgeGroup[],
        subcategories: [
            'html_structure',
            'css_styling',
            'javascript_interaction',
            'responsive_design'
        ]
    },
    
    COMPUTATIONAL_THINKING: {
        id: 'computational_thinking',
        name: 'Computational Thinking',
        description: 'Problem-solving and logical reasoning skills',
        icon: 'brain',
        color: '#FECA57',
        ageGroups: ['young_learners', 'elementary', 'advanced'] as AgeGroup[],
        subcategories: [
            'pattern_recognition',
            'decomposition',
            'abstraction',
            'algorithm_design'
        ]
    },
    
    ROBOTICS: {
        id: 'robotics',
        name: 'Robotics & Hardware',
        description: 'Programming physical devices and robots',
        icon: 'robot',
        color: '#A55EEA',
        ageGroups: ['elementary', 'advanced'] as AgeGroup[],
        subcategories: [
            'virtual_robotics',
            'sensor_programming',
            'motor_control',
            'automation'
        ]
    }
};

// ==========================================
// LEARNING MODALITIES AND PREFERENCES
// ==========================================

/**
 * Different learning styles and modalities supported
 */
export const LEARNING_MODALITIES = {
    VISUAL: {
        type: 'visual',
        name: 'Visual Learning',
        description: 'Learning through seeing and observing',
        techniques: [
            'diagrams_and_flowcharts',
            'color_coding',
            'visual_analogies',
            'step_by_step_animations'
        ],
        tools: ['block_programming', 'visual_debugger', 'concept_maps']
    },
    
    AUDITORY: {
        type: 'auditory',
        name: 'Auditory Learning',
        description: 'Learning through listening and speaking',
        techniques: [
            'narrated_tutorials',
            'audio_explanations',
            'verbal_instructions',
            'discussion_prompts'
        ],
        tools: ['voice_narration', 'audio_feedback', 'read_aloud']
    },
    
    KINESTHETIC: {
        type: 'kinesthetic',
        name: 'Hands-on Learning',
        description: 'Learning through doing and touching',
        techniques: [
            'interactive_exercises',
            'drag_and_drop',
            'building_activities',
            'trial_and_error'
        ],
        tools: ['interactive_coding', 'sandbox_mode', 'physical_computing']
    },
    
    READING_WRITING: {
        type: 'reading_writing',
        name: 'Reading/Writing Learning',
        description: 'Learning through text and written exercises',
        techniques: [
            'written_instructions',
            'code_documentation',
            'journaling',
            'note_taking'
        ],
        tools: ['text_editor', 'documentation', 'coding_notebooks']
    }
} as const;

// ==========================================
// ASSESSMENT AND EVALUATION
// ==========================================

/**
 * Assessment types and evaluation criteria
 */
export const ASSESSMENT_TYPES = {
    FORMATIVE: {
        type: 'formative',
        name: 'Ongoing Assessment',
        description: 'Continuous evaluation during learning',
        methods: [
            'progress_tracking',
            'peer_feedback',
            'self_reflection',
            'real_time_hints'
        ],
        frequency: 'continuous'
    },
    
    SUMMATIVE: {
        type: 'summative',
        name: 'End Assessment',
        description: 'Evaluation at the end of learning units',
        methods: [
            'project_completion',
            'skill_demonstration',
            'portfolio_review',
            'creative_showcase'
        ],
        frequency: 'unit_completion'
    },
    
    DIAGNOSTIC: {
        type: 'diagnostic',
        name: 'Skill Assessment',
        description: 'Identifying learning needs and strengths',
        methods: [
            'skill_mapping',
            'prerequisite_check',
            'learning_style_assessment',
            'interest_survey'
        ],
        frequency: 'initial_and_periodic'
    }
} as const;

// ==========================================
// GAMIFICATION AND MOTIVATION
// ==========================================

/**
 * Educational gamification elements
 */
export const GAMIFICATION_ELEMENTS = {
    BADGES: {
        categories: [
            'skill_mastery',
            'creativity',
            'persistence',
            'collaboration',
            'help_others',
            'exploration'
        ],
        rarities: ['common', 'uncommon', 'rare', 'epic', 'legendary']
    },
    
    ACHIEVEMENTS: {
        types: [
            'first_program',
            'debug_master',
            'creative_coder',
            'helpful_peer',
            'streak_keeper',
            'explorer'
        ],
        criteria: {
            time_based: ['daily_streak', 'weekly_goal', 'monthly_challenge'],
            skill_based: ['concept_mastery', 'advanced_technique', 'problem_solving'],
            social_based: ['peer_help', 'collaboration', 'mentoring']
        }
    },
    
    PROGRESSION: {
        levels: {
            structure: 'xp_based',
            max_level: 100,
            xp_per_level: 100,
            bonus_multipliers: {
                young_learners: 1.5,  // ages 4-6
                elementary: 1.3,      // ages 7-10
                advanced: 1.0         // ages 11-15
            }
        },
        unlockables: [
            'new_programming_languages',
            'advanced_tools',
            'special_projects',
            'mentor_privileges'
        ]
    }
} as const;

// ==========================================
// ACCESSIBILITY AND INCLUSION
// ==========================================

/**
 * Accessibility features and inclusive design principles
 */
export const ACCESSIBILITY_FEATURES = {
    VISUAL: {
        high_contrast: 'Enhanced contrast for better visibility',
        large_fonts: 'Adjustable font sizes for readability',
        color_blind_friendly: 'Alternative visual indicators',
        screen_reader: 'Compatible with screen reading software'
    },
    
    MOTOR: {
        keyboard_navigation: 'Full keyboard accessibility',
        click_alternatives: 'Alternative input methods',
        adjustable_timing: 'Customizable interaction timing',
        voice_commands: 'Voice-controlled programming'
    },
    
    COGNITIVE: {
        simplified_interface: 'Reduced cognitive load interface',
        clear_instructions: 'Step-by-step clear guidance',
        progress_indicators: 'Visual progress tracking',
        error_prevention: 'Preventive design to avoid confusion'
    },
    
    LANGUAGE: {
        multilingual_support: 'Multiple language interfaces',
        simplified_language: 'Age-appropriate vocabulary',
        visual_programming: 'Language-independent block coding',
        translation_tools: 'Built-in translation assistance'
    }
} as const;

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Valid age group values - Updated to 3 categories
 */
export type AgeGroup = 'young_learners' | 'elementary' | 'advanced';

/**
 * Valid difficulty levels
 */
export type DifficultyLevel = 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get appropriate difficulty levels for an age group
 */
export const getDifficultyLevelsForAge = (ageGroup: string): string[] => {
    const levels = Object.values(DIFFICULTY_LEVELS)
        .filter(level => level.ageGroups.includes(ageGroup as AgeGroup))
        .map(level => level.level);
    return levels;
};

/**
 * Get subject categories appropriate for an age group
 */
export const getSubjectCategoriesForAge = (ageGroup: string): typeof SUBJECT_CATEGORIES[keyof typeof SUBJECT_CATEGORIES][] => {
    return Object.values(SUBJECT_CATEGORIES)
        .filter(category => category.ageGroups.includes(ageGroup as AgeGroup));
};

/**
 * Get CS standards for a specific age group
 */
export const getCSStandardsForAge = (ageGroup: string) => {
    const standardsKey = ageGroup.toUpperCase() as keyof typeof CS_STANDARDS;
    return CS_STANDARDS[standardsKey] || null;
};

/**
 * Calculate recommended session time based on age
 */
export const getRecommendedSessionTime = (ageGroup: string): number => {
    const sessionTimes: Record<AgeGroup, number> = {
        'young_learners': 15, // 15 minutes (ages 4-6)
        'elementary': 30,     // 30 minutes (ages 7-10)
        'advanced': 45        // 45 minutes (ages 11-15)
    };
    
    return sessionTimes[ageGroup as AgeGroup] || 30;
};

/**
 * Check if a concept is appropriate for an age group
 */
export const isConceptAppropriate = (concept: string, ageGroup: string): boolean => {
    const standards = getCSStandardsForAge(ageGroup);
    return standards ? (standards.concepts as readonly string[]).includes(concept) : false;
};