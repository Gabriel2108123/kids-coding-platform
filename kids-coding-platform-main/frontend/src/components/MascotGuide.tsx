import React from 'react';
import { mascots } from '../data/mascotData';

interface MascotGuideProps {
  userId: string;
  selectedMascotId?: string;
  message?: string;
  expression?: 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating';
  showSpeechBubble?: boolean;
}

export const MascotGuide: React.FC<MascotGuideProps> = ({
  selectedMascotId = 'cody',
  message,
  expression = 'happy',
  showSpeechBubble = true
}) => {
  const mascot = mascots.find(m => m.id === selectedMascotId) || mascots[0];

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Ready for some coding adventures?";
    if (hour < 17) return "Good afternoon! Let's build something amazing!";
    return "Good evening! Time for some creative coding!";
  };

  const defaultMessage = message || getTimeBasedGreeting();

  return (
    <div className="mascot-guide flex items-center space-x-4 p-4 bg-white rounded-xl shadow-lg">
      <div className="mascot-avatar relative">
        <img 
          src={mascot.avatar.expressions[expression]} 
          alt={mascot.name}
          className="w-20 h-20 rounded-full border-4 border-purple-200 bounce"
        />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
          ✨
        </div>
      </div>
      
      {showSpeechBubble && (
        <div className="speech-bubble flex-1 relative">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg border-2 border-purple-200">
            <p className="text-gray-800 font-medium">{defaultMessage}</p>
            <div className="text-xs text-purple-600 mt-1 font-bold">
              - {mascot.name}
            </div>
          </div>
          {/* Speech bubble arrow */}
          <div className="absolute left-0 top-4 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-purple-200 -ml-2"></div>
        </div>
      )}
    </div>
  );
};

export const getProgressEncouragement = (totalXP: number, currentLevel: number): string => {
  const encouragements = [
    "You're doing amazing! Keep coding!",
    "Wow! Look at all that progress!",
    "You're becoming a coding superstar!",
    "Your skills are growing so fast!",
    "Ready for the next challenge?",
    "You're on fire today! 🔥",
    "Such creative thinking!",
    "You're a natural at this!"
  ];

  if (currentLevel >= 10) return "Incredible! You're a coding master! 🏆";
  if (currentLevel >= 5) return "Fantastic work! You're really getting the hang of this! 🌟";
  if (totalXP >= 100) return "Great job! You're building up those coding muscles! 💪";
  
  return encouragements[Math.floor(Math.random() * encouragements.length)];
};
