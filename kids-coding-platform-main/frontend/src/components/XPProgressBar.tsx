import React, { useState, useEffect } from 'react';
import { useSound } from '../utils/SoundManager';

interface XPProgressBarProps {
  currentXP: number;
  currentLevel: number;
  maxWidth?: string;
  showDetails?: boolean;
  recentXPGain?: number;
  animated?: boolean;
  showCelebration?: boolean;
}

const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  currentLevel,
  maxWidth = '100%',
  showDetails = true,
  recentXPGain = 0,
  animated = true,
  showCelebration = false
}) => {
  const [displayXP, setDisplayXP] = useState(currentXP - recentXPGain);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const { playLevelUp, playSuccess } = useSound();

  // Calculate XP needed for current level and next level
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = displayXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  // Animate XP gain
  useEffect(() => {
    if (recentXPGain > 0 && animated) {
      setIsAnimating(true);
      
      const duration = 1000;
      const startTime = Date.now();
      const startXP = currentXP - recentXPGain;
      
      const animateXP = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const newDisplayXP = startXP + (recentXPGain * easedProgress);
        
        setDisplayXP(newDisplayXP);
        
        if (progress < 1) {
          requestAnimationFrame(animateXP);
        } else {
          setIsAnimating(false);
          if (recentXPGain >= 50) {
            playSuccess();
          }
        }
      };
      
      requestAnimationFrame(animateXP);
    }
  }, [recentXPGain, currentXP, animated, playSuccess]);

  // Level up celebration
  useEffect(() => {
    if (showCelebration) {
      setShowLevelUp(true);
      playLevelUp();
      setTimeout(() => setShowLevelUp(false), 2000);
    }
  }, [showCelebration, playLevelUp]);

  return (
    <div className="w-full relative" style={{ maxWidth }}>
      {showDetails && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-lg font-bold text-gray-800">Level {currentLevel}</span>
            <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {Math.floor(displayXP)} XP
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {Math.floor(xpInCurrentLevel)}/{xpNeededForNextLevel} XP to Level {currentLevel + 1}
          </div>
        </div>
      )}
      
      <div className="relative">
        {/* Background bar */}
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
          {/* Progress bar */}
          <div
            className={`h-full progress-rainbow rounded-full transition-all duration-500 ease-out relative ${isAnimating ? 'animate-pulse-glow' : ''}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          </div>
          
          {/* XP gain animation overlay */}
          {isAnimating && recentXPGain > 0 && (
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full opacity-75 animate-sparkle"
              style={{ 
                width: `${Math.min(progressPercentage, 100)}%`,
                animation: 'xpGain 1s ease-out'
              }}
            />
          )}
        </div>
        
        {/* Level indicator */}
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 border-3 border-white rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg animate-bounce-soft">
          {currentLevel}
        </div>
        
        {/* Next level indicator */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
          {currentLevel + 1}
        </div>
      </div>
      
      {/* Recent XP gain indicator */}
      {recentXPGain > 0 && (
        <div className={`mt-2 text-center ${isAnimating ? 'animate-bounce' : ''}`}>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            +{recentXPGain} XP
          </span>
        </div>
      )}
      
      {/* Level up celebration */}
      {showLevelUp && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-lg animate-bounce shadow-lg">
            🎉 LEVEL UP! 🎉
          </div>
        </div>
      )}
      
      {/* XP milestone markers */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{xpForCurrentLevel} XP</span>
        <span>{xpForNextLevel} XP</span>
      </div>
    </div>
  );
};

export default XPProgressBar;
