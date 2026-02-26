import React, { useState } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { ChildProfile } from '../types/family';
import BlocklyEditor from '../editor/BlocklyEditor';
import PhaserGameEngine from '../engine/PhaserGameEngine';
import { useSound } from '../utils/SoundManager';
import { FrontendAgeGroup, normalizeAgeGroup } from '../utils/ageGroupUtils';

interface GameTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  concepts: string[];
  initialBlocks?: string;
  ageGroup: FrontendAgeGroup | 'all';
  instructions: string[];
  goals: string[];
  hints: string[];
  estimatedTime: string;
  gameType: 'click' | 'maze' | 'quiz' | 'drawing' | 'story' | 'platform' | 'puzzle';
}

const EnhancedGameBuilder: React.FC = () => {
  const { currentUser, userType } = useFamilyAuth();
  const { playClick, playSuccess, playError } = useSound();
  
  // Type guard for child user
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [gameTitle, setGameTitle] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [gameProgress, setGameProgress] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Age-specific game templates with enhanced difficulty progression
  const gameTemplates: GameTemplate[] = [
    // Beginner Templates (4-6 years)
    {
      id: 'simple-clicker',
      title: '🌟 Magic Star Collector',
      description: 'Click to collect magical stars!',
      difficulty: 'beginner',
      icon: '⭐',
      concepts: ['Clicking', 'Counting', 'Colors'],
      ageGroup: '4-6',
      gameType: 'click',
      estimatedTime: '10-15 min',
      instructions: [
        'Drag the "when clicked" block to start',
        'Add a "change color" block to make stars sparkle',
        'Use a "count up" block to keep score',
        'Make your star collection game!'
      ],
      goals: [
        'Create a clickable star',
        'Make it change colors when clicked',
        'Add a score counter',
        'Add fun sound effects'
      ],
      hints: [
        'The "when clicked" block is in the Events section',
        'Colors are in the Looks section',
        'Numbers are in the Math section'
      ],
      initialBlocks: `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_onclick" x="20" y="20">
          <statement name="DO">
            <block type="looks_changesizeby">
              <value name="CHANGE">
                <block type="math_number">
                  <field name="NUM">10</field>
                </block>
              </value>
            </block>
          </statement>
        </block>
      </xml>`
    },
    {
      id: 'animal-sounds',
      title: '🐱 Animal Sound Box',
      description: 'Create a fun animal sound machine!',
      difficulty: 'beginner',
      icon: '🎵',
      concepts: ['Sounds', 'Animals', 'Buttons'],
      ageGroup: '4-6',
      gameType: 'click',
      estimatedTime: '15-20 min',
      instructions: [
        'Choose your favorite animal',
        'Add animal sound blocks',
        'Make buttons for each animal',
        'Test your sound box!'
      ],
      goals: [
        'Create 3 animal buttons',
        'Each plays different sound',
        'Add animal pictures',
        'Make them move when clicked'
      ],
      hints: [
        'Sounds are in the Audio section',
        'Use "play sound" blocks',
        'Change costumes to show different animals'
      ]
    },

    // Intermediate Templates (7-10 years)
    {
      id: 'treasure-hunt',
      title: '🗺️ Treasure Hunt Adventure',
      description: 'Guide your character to find hidden treasure!',
      difficulty: 'intermediate',
      icon: '💎',
      concepts: ['Movement', 'Conditions', 'Variables'],
      ageGroup: '7-10',
      gameType: 'maze',
      estimatedTime: '20-30 min',
      instructions: [
        'Use arrow key blocks to move your character',
        'Add "if touching" blocks to detect treasure',
        'Create a score variable to count treasures',
        'Add obstacles and challenges!'
      ],
      goals: [
        'Move character with arrow keys',
        'Collect 5 treasures',
        'Avoid obstacles',
        'Show victory message when complete'
      ],
      hints: [
        'Movement blocks are in the Motion section',
        'Use "if" blocks from Logic section',
        'Variables help you keep track of things'
      ]
    },
    {
      id: 'quiz-master',
      title: '🧠 Super Quiz Game',
      description: 'Create your own quiz game with questions!',
      difficulty: 'intermediate',
      icon: '❓',
      concepts: ['Questions', 'Logic', 'Scoring'],
      ageGroup: '7-10',
      gameType: 'quiz',
      estimatedTime: '25-35 min',
      instructions: [
        'Create question blocks with multiple choice',
        'Use "if-else" blocks to check answers',
        'Add a score system for correct answers',
        'Make it colorful and fun!'
      ],
      goals: [
        'Create 5 different questions',
        'Check if answers are correct',
        'Keep score of right answers',
        'Show final score at the end'
      ],
      hints: [
        'Use "ask and wait" blocks for questions',
        'Compare answers with "equals" blocks',
        'Variables can store your score'
      ]
    },

    // Advanced Templates (11-15 years)
    {
      id: 'platform-adventure',
      title: '🎮 Platform Adventure',
      description: 'Build a side-scrolling platform game!',
      difficulty: 'advanced',
      icon: '🏃‍♂️',
      concepts: ['Physics', 'Collision', 'Levels', 'Game Logic'],
      ageGroup: '11-15',
      gameType: 'platform',
      estimatedTime: '45-60 min',
      instructions: [
        'Create gravity and jumping mechanics',
        'Design platforms and obstacles',
        'Add enemy AI with patrol patterns',
        'Implement level progression system'
      ],
      goals: [
        'Realistic character movement',
        'Multiple levels with increasing difficulty',
        'Enemy interactions and power-ups',
        'Score system with lives'
      ],
      hints: [
        'Use gravity variables for realistic movement',
        'Collision detection prevents falling through platforms',
        'Loops can create enemy movement patterns'
      ]
    },
    {
      id: 'strategy-puzzle',
      title: '🧩 Strategy Puzzle Master',
      description: 'Create a challenging strategy puzzle game!',
      difficulty: 'advanced',
      icon: '🎯',
      concepts: ['Algorithms', 'Problem Solving', 'Game AI'],
      ageGroup: '11-15',
      gameType: 'puzzle',
      estimatedTime: '50-70 min',
      instructions: [
        'Design puzzle mechanics and rules',
        'Implement move validation system',
        'Create AI opponents or helpers',
        'Add progressive difficulty levels'
      ],
      goals: [
        'Complex puzzle mechanics',
        'Strategic thinking required',
        'Multiple solution paths',
        'Adaptive difficulty system'
      ],
      hints: [
        'Break complex problems into smaller functions',
        'Use arrays to track game state',
        'Implement win/lose condition checking'
      ]
    }
  ];

  // Get age-appropriate templates
  const getAvailableTemplates = () => {
    if (!childUser || !childUser.ageGroup) return gameTemplates;
    
    const normalizedAge = normalizeAgeGroup(childUser.ageGroup);
    const userAgeGroup = normalizedAge.frontend;
    
    return gameTemplates.filter(template => 
      template.ageGroup === 'all' || 
      template.ageGroup === userAgeGroup ||
      (userAgeGroup === '11-15' && template.ageGroup === '7-10')
    );
  };

  const handleTemplateSelect = (template: GameTemplate) => {
    playClick();
    setSelectedTemplate(template.id);
    setGameTitle(template.title);
    setShowInstructions(true);
  };

  const handleCodeChange = (code: string) => {
    setGameCode(code);
    
    // Calculate progress based on code complexity
    const blockCount = (code.match(/\n/g) || []).length;
    const newProgress = Math.min((blockCount / 10) * 100, 100);
    setGameProgress(newProgress);
    
    // Check for achievements based on code content
    checkAchievementsFromCode(code);
  };

  const checkAchievementsFromCode = (code: string) => {
    const newAchievements: string[] = [];
    
    if (code.includes('playSound') && !achievements.includes('first-sound')) {
      newAchievements.push('first-sound');
    }
    
    if (code.includes('sprite.tint') && !achievements.includes('color-master')) {
      newAchievements.push('color-master');
    }
    
    if ((code.match(/\n/g) || []).length >= 5 && !achievements.includes('code-builder')) {
      newAchievements.push('code-builder');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      playSuccess();
    }
  };

  const handleRunGame = (code: string) => {
    playSuccess();
    setIsPreviewMode(true);
  };

  const handleSaveGame = async () => {
    if (!gameTitle || !gameCode) {
      playError();
      alert('Please add a title and some code to your game!');
      return;
    }

    try {
      playSuccess();
      alert('Game saved successfully! 🎉');
    } catch (error) {
      playError();
      alert('Error saving game. Please try again.');
    }
  };

  const selectedTemplateData = gameTemplates.find(t => t.id === selectedTemplate);
  const availableTemplates = getAvailableTemplates();

  // Achievement messages
  const achievementMessages: Record<string, string> = {
    'first-click': '🎉 First Click! You made something interactive!',
    'variable-master': '📊 Variable Master! You can store data now!',
    'block-builder': '🧱 Block Builder! You\'re building complex code!'
  };

  return (
    <div className="enhanced-game-builder min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Floating Achievement Notifications */}
      {achievements.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {achievements.slice(-3).map((achievement) => (
            <div
              key={achievement}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce"
            >
              {achievementMessages[achievement]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Progress */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎮 Block Game Builder
          </h1>
          <p className="text-xl text-gray-700 mb-4">Create amazing games with visual coding blocks!</p>
          
          {selectedTemplate && (
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(gameProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${gameProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {!selectedTemplate ? (
          // Enhanced Template Selection
          <div className="template-selection">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Adventure! 🚀</h2>
              <p className="text-gray-600">Pick a game template that matches your skill level</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableTemplates.map((template) => (
                <div
                  key={template.id}
                  className="template-card group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-400 transform hover:-translate-y-2"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="text-center">
                    <div className="text-8xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {template.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{template.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{template.description}</p>
                    
                    {/* Difficulty and Time */}
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        template.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {template.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">⏱️ {template.estimatedTime}</span>
                    </div>
                    
                    {/* Concepts */}
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {template.concepts.map((concept, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all group-hover:shadow-lg">
                      Start Building! 🎯
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Enhanced Game Builder Interface
          <div className="game-builder-interface">
            {/* Top Controls */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    ← Choose Different Game
                  </button>
                  <div className="text-2xl">{selectedTemplateData?.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-800">{selectedTemplateData?.title}</h3>
                    <p className="text-sm text-gray-600">{selectedTemplateData?.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      showInstructions 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📋 {showInstructions ? 'Hide' : 'Show'} Instructions
                  </button>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      showHints 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    💡 {showHints ? 'Hide' : 'Show'} Hints
                  </button>
                  <button
                    onClick={() => handleRunGame(gameCode)}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all shadow-lg"
                    disabled={!gameCode}
                  >
                    ▶️ Play Game
                  </button>
                </div>
              </div>
              
              {/* Game Title Input */}
              <div className="mt-4">
                <input
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="Give your game an awesome name..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-lg font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6" style={{ minHeight: '600px', height: 'auto' }}>
              {/* Instructions Sidebar */}
              {showInstructions && (
                <div className="col-span-3 bg-white rounded-xl shadow-lg p-6" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <div className="sticky top-0 bg-white pb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      📋 Instructions
                    </h3>
                  </div>
                  
                  {/* Steps */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">How to Build:</h4>
                    {selectedTemplateData?.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{instruction}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Goals */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Your Goals:</h4>
                    {selectedTemplateData?.goals.map((goal, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-4 h-4 border-2 border-green-500 rounded mt-1 flex-shrink-0"></div>
                        <p className="text-gray-700 text-sm leading-relaxed">{goal}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Hints */}
                  {showHints && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-700 mb-3 flex items-center">
                        💡 Helpful Hints
                      </h4>
                      <div className="space-y-2">
                        {selectedTemplateData?.hints.map((hint, index) => (
                          <p key={index} className="text-yellow-700 text-sm">• {hint}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Blockly Editor */}
              <div className={`${showInstructions ? 'col-span-5' : 'col-span-7'} bg-white rounded-xl shadow-lg p-4`}>
                <div className="h-full w-full" style={{ minHeight: '600px', height: '600px' }}>
                  <BlocklyEditor
                    ageGroup={normalizeAgeGroup(childUser?.ageGroup || '8-10').frontend}
                    onCodeChange={handleCodeChange}
                  />
                </div>
              </div>

              {/* Game Preview */}
              <div className="col-span-4 bg-white rounded-xl shadow-lg">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">🎮 Game Preview</h3>
                    <button
                      onClick={handleSaveGame}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm transition-colors"
                      disabled={!gameCode}
                    >
                      💾 Save
                    </button>
                  </div>
                </div>
                
                <div className="h-full bg-gray-50">
                  {isPreviewMode && gameCode ? (
                    <PhaserGameEngine
                      gameCode={gameCode}
                      gameType={selectedTemplateData?.gameType as any}
                      width={380}
                      height={500}
                      onGameEvent={(event, data) => {
                        if (event === 'game_complete') {
                          playSuccess();
                          setAchievements(prev => [...prev, 'game-complete']);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-center p-8">
                      <div>
                        <div className="text-6xl mb-4">🎯</div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Ready to Play?</h4>
                        <p className="text-gray-600 text-sm mb-4">
                          Add some blocks and click "Play Game" to see your creation come to life!
                        </p>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-700">
                            💡 Tip: Start with the blocks shown in the instructions!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedGameBuilder;
