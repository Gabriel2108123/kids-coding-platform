import React, { useState, useEffect } from 'react';
import { getDefaultMascot } from '../data/mascotData';

interface MascotSelectorProps {
  onSelect: (mascotId: string) => void;
  userLevel?: number;
  userBadges?: string[];
  completedModules?: string[];
  userXP?: number;
}

const MascotSelector: React.FC<MascotSelectorProps> = ({
  onSelect
}) => {
  const [isIntroducing, setIsIntroducing] = useState(true);
  
  const bugsby = getDefaultMascot(); // Always Bugsby

  useEffect(() => {
    // Auto-select Bugsby after a brief introduction
    const timer = setTimeout(() => {
      setIsIntroducing(false);
      onSelect('bugsby');
    }, 3000);

    return () => clearTimeout(timer);
  }, [onSelect]);

  const handleContinue = () => {
    setIsIntroducing(false);
    onSelect('bugsby');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to Bugsby Coding World! 🌟</h1>
          <p className="text-white text-xl opacity-90">
            Meet your coding companion who will guide you on this amazing journey
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Bugsby Introduction Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center transform hover:scale-105 transition-all duration-300">
            {/* Mascot Avatar */}
            <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
              <img
                src={bugsby.avatar.static}
                alt={bugsby.name}
                className="w-40 h-40 object-contain"
                onError={(e) => {
                  // Fallback to a placeholder if image not found
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjgwIiBjeT0iODAiIHI9IjgwIiBmaWxsPSIjNEE5MEUyIi8+Cjx0ZXh0IHg9IjgwIiB5PSI5MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QnVnc2J5PC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
            </div>

            {/* Mascot Info */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">{bugsby.name}</h2>
              <p className="text-lg text-gray-600 mb-4">{bugsby.description}</p>
              <p className="text-md text-gray-500 italic">{bugsby.personality}</p>
            </div>

            {/* Introduction Text */}
            {isIntroducing && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400">
                <p className="text-blue-800 text-lg font-medium">
                  "{bugsby.phrases.greeting[0]}"
                </p>
              </div>
            )}

            {/* Specialties */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">What I can help you with:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {bugsby.specialties.slice(0, 4).map((specialty: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
                {bugsby.specialties.length > 4 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    +{bugsby.specialties.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleContinue}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Let's Start Coding Together! 🚀
            </button>
          </div>

          {/* Welcome Message */}
          <div className="mt-8 text-center">
            <p className="text-white text-lg opacity-90">
              Bugsby will be with you every step of the way as you learn, create, and explore the world of coding!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MascotSelector;
