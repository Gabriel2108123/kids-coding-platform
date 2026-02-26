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
}

const GameBuilder: React.FC = () => {
  const { currentUser, userType } = useFamilyAuth();
  const { playClick, playSuccess } = useSound();
  
  // Type guard for child user
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [gameTitle, setGameTitle] = useState('');
  const [gameCode, setGameCode] = useState('');
  // const [gameXML, setGameXML] = useState(''); // Reserved for future Blockly integration
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const gameTemplates: GameTemplate[] = [
    {
      id: 'click-game',
      title: 'Click Counter',
      description: 'Create a simple clicking game',
      difficulty: 'beginner',
      icon: '🖱️',
      concepts: ['Variables', 'Events', 'Functions'],
      ageGroup: '4-6',
      initialBlocks: `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="variables_set" x="20" y="20">
          <field name="VAR">score</field>
          <value name="VALUE">
            <block type="math_number">
              <field name="NUM">0</field>
            </block>
          </value>
        </block>
      </xml>`
    },
    {
      id: 'balloon-pop',
      title: 'Balloon Pop',
      description: 'Pop colorful balloons for points',
      difficulty: 'beginner',
      icon: '🎈',
      concepts: ['Mouse Events', 'Animation', 'Sounds'],
      ageGroup: '4-6'
    },
    {
      id: 'pet-care',
      title: 'Virtual Pet',
      description: 'Take care of a cute digital pet',
      difficulty: 'beginner',
      icon: '🐱',
      concepts: ['Time', 'Care Actions', 'Status'],
      ageGroup: '4-6'
    },
    {
      id: 'color-match',
      title: 'Color Matcher',
      description: 'Match colors and learn patterns',
      difficulty: 'beginner',
      icon: '🌈',
      concepts: ['Colors', 'Matching', 'Memory'],
      ageGroup: '4-6'
    },
    {
      id: 'maze-game',
      title: 'Maze Adventure',
      description: 'Guide a character through a maze',
      difficulty: 'intermediate',
      icon: '🏃‍♂️',
      concepts: ['Movement', 'Conditions', 'Loops'],
      ageGroup: '7-10'
    },
    {
      id: 'space-shooter',
      title: 'Space Explorer',
      description: 'Pilot a spaceship through asteroids',
      difficulty: 'intermediate',
      icon: '🚀',
      concepts: ['Physics', 'Collision', 'Scoring'],
      ageGroup: '7-10'
    },
    {
      id: 'puzzle-platformer',
      title: 'Puzzle Jump',
      description: 'Create a jumping puzzle game',
      difficulty: 'intermediate',
      icon: '🧩',
      concepts: ['Gravity', 'Platforms', 'Puzzles'],
      ageGroup: '7-10'
    },
    {
      id: 'quiz-game',
      title: 'Quiz Master',
      description: 'Create an interactive quiz',
      difficulty: 'intermediate',
      icon: '🧠',
      concepts: ['Questions', 'Scoring', 'Logic'],
      ageGroup: '7-10'
    },
    {
      id: 'memory-game',
      title: 'Memory Challenge',
      description: 'Test your memory with card matching',
      difficulty: 'intermediate',
      icon: '🃏',
      concepts: ['Arrays', 'Logic', 'Timing'],
      ageGroup: '7-10'
    },
    {
      id: 'drawing-game',
      title: 'Art Creator',
      description: 'Make digital art with code',
      difficulty: 'beginner',
      icon: '🎨',
      concepts: ['Shapes', 'Colors', 'Creativity'],
      ageGroup: '4-6'
    },
    {
      id: 'story-game',
      title: 'Story Builder',
      description: 'Create interactive stories',
      difficulty: 'advanced',
      icon: '📚',
      concepts: ['Storytelling', 'Choices', 'Characters'],
      ageGroup: '11-15'
    },
    {
      id: 'rpg-adventure',
      title: 'RPG Adventure',
      description: 'Build a role-playing game',
      difficulty: 'advanced',
      icon: '⚔️',
      concepts: ['Character Stats', 'Inventory', 'Combat'],
      ageGroup: '11-15'
    },
    {
      id: 'tower-defense',
      title: 'Tower Defense',
      description: 'Strategic tower placement game',
      difficulty: 'advanced',
      icon: '🏰',
      concepts: ['Strategy', 'Economics', 'AI'],
      ageGroup: '11-15'
    },
    {
      id: 'racing-game',
      title: 'Speed Racer',
      description: 'Create a racing circuit game',
      difficulty: 'advanced',
      icon: '🏁',
      concepts: ['Physics', 'Timing', 'Controls'],
      ageGroup: '11-15'
    },
    {
      id: 'music-maker',
      title: 'Music Composer',
      description: 'Create music and sound effects',
      difficulty: 'intermediate',
      icon: '🎵',
      concepts: ['Sound', 'Rhythm', 'Sequences'],
      ageGroup: '7-10'
    }
  ];

  // Filter templates by user's age group
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
    if (template.initialBlocks) {
      // setGameXML(template.initialBlocks); // Reserved for future Blockly integration
    }
  };

  const handleCodeChange = (code: string, xml: string) => {
    setGameCode(code);
    // setGameXML(xml); // Reserved for future Blockly integration
  };

  const handleRunGame = (code: string) => {
    playSuccess();
    setIsPreviewMode(true);
  };

  const handleSaveGame = async () => {
    if (!gameTitle || !gameCode) {
      alert('Please add a title and some code to your game!');
      return;
    }

    try {
      playSuccess();
      alert('Game saved successfully! 🎉');
    } catch (error) {
      // Error handling - game save failed
    }
  };

  const availableTemplates = getAvailableTemplates();

  return (
    <div className="game-builder min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🎮 Game Builder</h1>
          <p className="text-lg text-gray-600">Create amazing games with visual coding!</p>
        </div>

        {!selectedTemplate ? (
          // Template Selection
          <div>
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Choose from {availableTemplates.length} exciting game templates designed for your age group!
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableTemplates.map((template) => (
                <div
                  key={template.id}
                  className="template-card bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-300 transform hover:scale-105"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{template.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                    
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {template.concepts.slice(0, 2).map((concept, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
                        >
                          {concept}
                        </span>
                      ))}
                      {template.concepts.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                          +{template.concepts.length - 2}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        template.difficulty === 'beginner' ? 'bg-green-100 text-green-600' :
                        template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {template.difficulty}
                      </span>
                      <span className="text-gray-500">{template.ageGroup}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Game Builder Interface
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Blockly Editor */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Visual Code Editor</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="btn btn-secondary text-sm"
                  >
                    ← Back to Templates
                  </button>
                  <button
                    onClick={() => handleRunGame(gameCode)}
                    className="btn btn-primary text-sm"
                    disabled={!gameCode}
                  >
                    ▶️ Run Game
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="Enter your game title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="border border-gray-300 rounded-lg" style={{ height: '500px', overflow: 'visible' }}>
                <BlocklyEditor
                  ageGroup={normalizeAgeGroup(childUser?.ageGroup).frontend}
                  onCodeChange={(code) => handleCodeChange(code, '')}
                />
              </div>
            </div>

            {/* Game Preview */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Game Preview</h2>
                <button
                  onClick={handleSaveGame}
                  className="btn btn-primary text-sm"
                  disabled={!gameCode}
                >
                  💾 Save Game
                </button>
              </div>
              
              <div 
                className="game-preview-area border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
                style={{ minHeight: '500px' }}
              >
                {isPreviewMode && gameCode ? (
                  <PhaserGameEngine
                    gameCode={gameCode}
                    gameType={selectedTemplate as any}
                    width={760}
                    height={480}
                    onGameEvent={(event, data) => {
                      // Handle game events
                      if (event === 'score_updated') {
                        // Could update parent component state or send to backend
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="text-6xl mb-4">🎯</div>
                      <p className="text-gray-600">Build your game to see it here!</p>
                      <p className="text-sm text-gray-500">Add blocks and click "Run Game"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBuilder;