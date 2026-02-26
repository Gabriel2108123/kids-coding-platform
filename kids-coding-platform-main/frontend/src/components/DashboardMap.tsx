import React from 'react';

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  topics: string[];
  unlocked: boolean;
  completed: boolean;
  position: { x: number; y: number };
  island: string;
}

interface DashboardMapProps {
  completedModules: string[];
  currentModule?: string;
  userLevel: number;
  onModuleSelect: (moduleId: string) => void;
}

const DashboardMap: React.FC<DashboardMapProps> = ({
  completedModules,
  currentModule,
  userLevel,
  onModuleSelect
}) => {
  // Mock modules data - in real app this would come from props or context
  const modules: Module[] = [
    {
      id: 'basics-1',
      title: 'Welcome to Coding',
      description: 'Learn what coding is and meet your first program',
      difficulty: 'beginner',
      estimatedTime: '15 min',
      topics: ['Introduction', 'First Steps'],
      unlocked: true,
      completed: completedModules.includes('basics-1'),
      position: { x: 10, y: 85 },
      island: 'Beginner Bay'
    },
    {
      id: 'basics-2',
      title: 'Sequences & Commands',
      description: 'Learn to give computers step-by-step instructions',
      difficulty: 'beginner',
      estimatedTime: '20 min',
      topics: ['Sequences', 'Commands'],
      unlocked: completedModules.includes('basics-1'),
      completed: completedModules.includes('basics-2'),
      position: { x: 25, y: 75 },
      island: 'Beginner Bay'
    },
    {
      id: 'loops-1',
      title: 'Loops Island',
      description: 'Discover the magic of repeating actions',
      difficulty: 'beginner',
      estimatedTime: '25 min',
      topics: ['For Loops', 'While Loops'],
      unlocked: completedModules.includes('basics-2'),
      completed: completedModules.includes('loops-1'),
      position: { x: 45, y: 60 },
      island: 'Loops Island'
    },
    {
      id: 'variables-1',
      title: 'Variables Valley',
      description: 'Learn to store and use information',
      difficulty: 'intermediate',
      estimatedTime: '30 min',
      topics: ['Variables', 'Data Types'],
      unlocked: completedModules.includes('loops-1'),
      completed: completedModules.includes('variables-1'),
      position: { x: 70, y: 45 },
      island: 'Variables Valley'
    },
    {
      id: 'functions-1',
      title: 'Function Forest',
      description: 'Create reusable code blocks',
      difficulty: 'intermediate',
      estimatedTime: '35 min',
      topics: ['Functions', 'Parameters'],
      unlocked: completedModules.includes('variables-1'),
      completed: completedModules.includes('functions-1'),
      position: { x: 85, y: 30 },
      island: 'Function Forest'
    },
    {
      id: 'conditionals-1',
      title: 'Decision Desert',
      description: 'Make your programs smart with if/else',
      difficulty: 'intermediate',
      estimatedTime: '30 min',
      topics: ['If Statements', 'Boolean Logic'],
      unlocked: completedModules.includes('functions-1'),
      completed: completedModules.includes('conditionals-1'),
      position: { x: 60, y: 15 },
      island: 'Decision Desert'
    },
    {
      id: 'games-1',
      title: 'Game Galaxy',
      description: 'Build your first interactive game',
      difficulty: 'advanced',
      estimatedTime: '45 min',
      topics: ['Game Logic', 'User Input'],
      unlocked: completedModules.includes('conditionals-1'),
      completed: completedModules.includes('games-1'),
      position: { x: 30, y: 10 },
      island: 'Game Galaxy'
    }
  ];

  const getModuleIcon = (module: Module) => {
    if (module.completed) return '✅';
    if (!module.unlocked) return '🔒';
    if (module.id === currentModule) return '⭐';
    return '🎯';
  };

  const getModuleStatus = (module: Module) => {
    if (module.completed) return 'completed';
    if (!module.unlocked) return 'locked';
    if (module.id === currentModule) return 'current';
    return 'available';
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600 hover:bg-green-600';
      case 'current':
        return 'bg-yellow-500 border-yellow-600 hover:bg-yellow-600 animate-pulse';
      case 'available':
        return 'bg-blue-500 border-blue-600 hover:bg-blue-600';
      case 'locked':
        return 'bg-gray-400 border-gray-500 cursor-not-allowed';
      default:
        return 'bg-gray-400 border-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Learning Adventure Map 🗺️</h2>
        <p className="text-gray-600">Click on an unlocked module to start your coding journey!</p>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-200 via-green-200 to-purple-200 rounded-xl overflow-hidden border-4 border-blue-300">
        {/* Background decorations */}
        <div className="absolute inset-0">
          {/* Clouds */}
          <div className="absolute top-4 left-20 w-12 h-6 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-8 right-32 w-16 h-8 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-12 left-1/2 w-10 h-5 bg-white rounded-full opacity-80"></div>
          
          {/* Water/Rivers */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-blue-400 opacity-60"></div>
          
          {/* Islands/paths */}
          <div className="absolute bottom-4 left-4 w-24 h-16 bg-green-400 rounded-full opacity-40"></div>
          <div className="absolute top-1/2 right-8 w-32 h-20 bg-yellow-300 rounded-full opacity-40"></div>
        </div>

        {/* Connection lines between modules */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {modules.slice(0, -1).map((module, index) => {
            const nextModule = modules[index + 1];
            if (!nextModule) return null;
            
            const x1 = (module.position.x / 100) * 100;
            const y1 = (module.position.y / 100) * 100;
            const x2 = (nextModule.position.x / 100) * 100;
            const y2 = (nextModule.position.y / 100) * 100;
            
            return (
              <line
                key={`${module.id}-${nextModule.id}`}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="#4F46E5"
                strokeWidth="3"
                strokeDasharray={module.completed ? "0" : "10,5"}
                className="opacity-60"
              />
            );
          })}
        </svg>

        {/* Module nodes */}
        {modules.map((module) => {
          const status = getModuleStatus(module);
          const canClick = module.unlocked;
          
          return (
            <div
              key={module.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${module.position.x}%`,
                top: `${module.position.y}%`
              }}
            >
              <button
                onClick={() => canClick && onModuleSelect(module.id)}
                disabled={!canClick}
                className={`w-16 h-16 rounded-full border-4 text-2xl font-bold text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 ${getStatusColors(status)}`}
                title={module.title}
              >
                {getModuleIcon(module)}
              </button>
              
              {/* Module info tooltip */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-48 opacity-0 hover:opacity-100 transition-opacity duration-200 z-10">
                <h3 className="font-bold text-gray-800 text-sm mb-1">{module.title}</h3>
                <p className="text-gray-600 text-xs mb-2">{module.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    module.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    module.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {module.difficulty}
                  </span>
                  <span className="text-gray-500">{module.estimatedTime}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {module.topics.slice(0, 2).map((topic) => (
                    <span key={topic} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-gray-600">Locked</span>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Progress Summary</h3>
            <p className="text-gray-600 text-sm">
              {completedModules.length} of {modules.length} modules completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((completedModules.length / modules.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedModules.length / modules.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMap;
