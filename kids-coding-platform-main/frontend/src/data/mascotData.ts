// Mascot data for Bugsby Coding World
// Single companion for all ages and learning stages

export interface Mascot {
  id: string;
  name: string;
  description: string;
  personality: string;
  specialties: string[];
  ageGroup: 'all';
  difficulty: 'all';
  avatar: {
    static: string;
    animated: string;
    expressions: {
      happy: string;
      excited: string;
      thinking: string;
      surprised: string;
      celebrating: string;
      confused: string;
      encouraging: string;
    };
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  sounds: {
    greeting: string;
    success: string;
    error: string;
    hint: string;
    celebration: string;
  };
  phrases: {
    greeting: string[];
    encouragement: string[];
    success: string[];
    hint: string[];
    error: string[];
    celebration: string[];
  };
  isDefault: boolean;
  isAccessible: boolean;
}

// Single mascot companion - Bugsby
export const mascots: Mascot[] = [
  {
    id: 'bugsby',
    name: 'Bugsby',
    description: 'Your friendly coding companion who will guide you through your entire coding journey in Bugsby Coding World!',
    personality: 'Encouraging, patient, wise, and always ready to help you learn and create amazing things',
    specialties: [
      'Programming Fundamentals', 
      'Creative Coding', 
      'Problem Solving', 
      'Game Development',
      'Web Development',
      'Debugging',
      'Best Practices'
    ],
    ageGroup: 'all',
    difficulty: 'all',
    avatar: {
      static: '/images/bugsby-mascot.png', // Updated to use custom uploaded image
      animated: '/images/mascots/bugsby/animated.gif',
      expressions: {
        happy: '/images/bugsby-mascot.png', // Use main image for now, can be expanded later
        excited: '/images/bugsby-mascot.png',
        thinking: '/images/bugsby-mascot.png',
        surprised: '/images/bugsby-mascot.png',
        celebrating: '/images/bugsby-mascot.png',
        confused: '/images/bugsby-mascot.png',
        encouraging: '/images/bugsby-mascot.png'
      }
    },
    colors: {
      primary: '#4A90E2',    // Friendly blue
      secondary: '#7BB3F0',  // Light blue
      accent: '#FFD93D'      // Warm yellow
    },
    sounds: {
      greeting: '/sounds/bugsby/greeting.mp3',
      success: '/sounds/bugsby/success.mp3',
      error: '/sounds/bugsby/error.mp3',
      hint: '/sounds/bugsby/hint.mp3',
      celebration: '/sounds/bugsby/celebration.mp3'
    },
    phrases: {
      greeting: [
        "Hello there, young coder! I'm Bugsby, and I'm here to help you on your coding adventure!",
        "Welcome to Bugsby Coding World! Let's create something amazing together!",
        "Hi! Ready to explore the wonderful world of coding with me?",
        "Great to see you! I'm excited to be your coding companion today!"
      ],
      encouragement: [
        "You're doing great! Keep going!",
        "Every expert was once a beginner. You're on the right track!",
        "Don't worry about mistakes - they're how we learn!",
        "I believe in you! You can figure this out!",
        "That's the spirit! Learning to code is an adventure!",
        "You're getting the hang of this! Keep experimenting!"
      ],
      success: [
        "Fantastic! You solved it perfectly!",
        "Wow! That was excellent coding!",
        "Brilliant work! You're becoming a great programmer!",
        "Outstanding! I'm so proud of your progress!",
        "Amazing! You're really getting good at this!",
        "Perfect! That's exactly how a real programmer thinks!"
      ],
      hint: [
        "Think about breaking this problem into smaller steps...",
        "Remember, coding is like solving a puzzle - piece by piece!",
        "What if you tried approaching this from a different angle?",
        "Sometimes the answer is simpler than you think!",
        "Let's think through this step by step together...",
        "Take your time - good coding takes patience!"
      ],
      error: [
        "Oops! No worries - even the best programmers make mistakes!",
        "That's not quite right, but you're learning! Let's try again!",
        "Every error is a learning opportunity! What can we learn from this?",
        "Don't give up! Debugging is a superpower that all coders need!",
        "That's okay! Making mistakes is part of becoming a great coder!",
        "Let's figure this out together - I'm here to help!"
      ],
      celebration: [
        "🎉 You did it! Time to celebrate your coding success!",
        "🌟 Incredible! You've reached a new milestone!",
        "🚀 Amazing work! You're becoming a coding superstar!",
        "🏆 Congratulations! That was some serious coding skills!",
        "✨ Fantastic! You should be proud of what you've accomplished!",
        "🎈 Hooray! Another coding challenge conquered!"
      ]
    },
    isDefault: true,
    isAccessible: true
  }
];

// Helper functions
export const getMascotById = (id: string): Mascot | undefined => {
  return mascots.find(mascot => mascot.id === id);
};

export const getDefaultMascot = (): Mascot => {
  return mascots[0]; // Always returns Bugsby
};

export const getAllMascots = (): Mascot[] => {
  return mascots;
};

// Since we only have one mascot now, these functions are simplified
export const getMascotsByAgeGroup = (_ageGroup: string): Mascot[] => {
  return mascots; // Bugsby works for all age groups
};

export const getMascotsByDifficulty = (_difficulty: string): Mascot[] => {
  return mascots; // Bugsby works for all difficulty levels
};

// Helper function to get random phrases from Bugsby
export const getRandomPhrase = (mascot: Mascot | null, type: keyof Mascot['phrases']): string => {
  if (!mascot || !mascot.phrases[type] || mascot.phrases[type].length === 0) {
    // Default fallback phrases for Bugsby
    const fallbackPhrases = {
      greeting: ["Hi there! I'm Bugsby, ready to help you code!"],
      encouragement: ["You're doing great! Keep going!"],
      success: ["Fantastic! You solved it perfectly!"],
      hint: ["Think about breaking this problem into smaller steps..."],
      error: ["Oops! No worries - even the best programmers make mistakes!"],
      celebration: ["🎉 You did it! Time to celebrate your coding success!"]
    };
    
    const phrases = fallbackPhrases[type] || fallbackPhrases.greeting;
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  
  const phrases = mascot.phrases[type];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// Helper function to get random phrases by type for the default mascot (Bugsby)
export const getRandomPhraseByType = (type: keyof Mascot['phrases']): string => {
  const bugsby = getDefaultMascot();
  return getRandomPhrase(bugsby, type);
};
