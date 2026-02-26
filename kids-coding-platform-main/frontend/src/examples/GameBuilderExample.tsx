import React from 'react';
import EnhancedGameBuilder from '../components/EnhancedGameBuilder';

/**
 * Example usage of the Enhanced Game Builder component
 * 
 * This component demonstrates how to integrate the Enhanced Game Builder
 * into your application with proper context providers.
 */

const GameBuilderExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎮 Kids Game Builder
          </h1>
          <p className="text-xl text-white/80">
            Create amazing games with block coding!
          </p>
        </div>

        {/* Enhanced Game Builder Component */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <EnhancedGameBuilder />
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Age-Appropriate</h3>
            <p className="text-white/80">
              Different difficulty levels for ages 4-6, 7-10, and 11-15
            </p>
          </div>
          
          <div className="text-center text-white">
            <div className="text-4xl mb-4">🌈</div>
            <h3 className="text-xl font-bold mb-2">Visual & Fun</h3>
            <p className="text-white/80">
              Emoji-rich blocks and colorful interface designed for kids
            </p>
          </div>
          
          <div className="text-center text-white">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">Educational</h3>
            <p className="text-white/80">
              Step-by-step instructions and achievement system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBuilderExample;

/**
 * Integration Notes:
 * 
 * 1. Family Auth Context Required:
 *    The EnhancedGameBuilder requires FamilyAuthContext to work properly.
 *    Make sure to wrap your app with the FamilyAuthProvider.
 * 
 * 2. Sound Manager:
 *    The component uses sound effects for feedback. Ensure sound files
 *    are available in your public/sounds directory.
 * 
 * 3. Blockly Dependencies:
 *    Make sure blockly is properly installed: npm install blockly
 * 
 * 4. Age Group Detection:
 *    The component automatically detects the child's age group from
 *    the family auth context and adjusts difficulty accordingly.
 * 
 * 5. Game Templates:
 *    Six pre-built game templates are available:
 *    - Simple Clicker (Ages 4-6)
 *    - Color Mixer (Ages 4-6)
 *    - Treasure Hunt (Ages 7-10)
 *    - Maze Runner (Ages 7-10)
 *    - Tower Defense (Ages 11-15)
 *    - Physics Playground (Ages 11-15)
 */
