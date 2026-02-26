import React, { useState, useEffect } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { ChildProfile } from '../types/family';
import { getMascotById, getRandomPhrase } from '../data/mascotData';
import { useAIMascot } from '../hooks/useAIMascot';
import AIMascotChat from './AIMascotChat';

interface ModuleIntroductionProps {
  moduleId: string;
}

const ModuleIntroduction: React.FC<ModuleIntroductionProps> = ({ moduleId }) => {
  const { currentUser, userType } = useFamilyAuth();
  const [currentStep, setCurrentStep] = useState<'intro' | 'video' | 'coding' | 'quiz' | 'build'>('intro');
  const [aiMascotMessage, setAiMascotMessage] = useState<string>('');
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  
  // Type guard for child user
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;
  
  // Helper function to get the selected mascot (single mascot system)
  const getSelectedMascot = (user: ChildProfile | null): string | null => {
    if (!user) return null;
    return user.settings?.learning?.visualPreferences?.[0] || null;
  };
  
  const selectedMascotId = getSelectedMascot(childUser);
  const selectedMascot = selectedMascotId ? getMascotById(selectedMascotId) : null;

  // AI Mascot hook
  const { getStepMessage, celebrate } = useAIMascot();

  // Load AI mascot message when step changes
  useEffect(() => {
    const loadMascotMessage = async () => {
      if (!selectedMascot) return;
      
      setIsLoadingMessage(true);
      try {
        const message = await getStepMessage(moduleId, currentStep);
        if (message) {
          setAiMascotMessage(message);
        }
      } catch (error) {
        // Fallback to static message if AI fails
        setAiMascotMessage(getRandomPhrase(selectedMascot, 'greeting'));
      } finally {
        setIsLoadingMessage(false);
      }
    };

    loadMascotMessage();
  }, [currentStep, moduleId, selectedMascot, getStepMessage]);

  // Mock module data - in real app this would be fetched from API
  const moduleData = {
    'basics-1': {
      title: 'Welcome to Coding',
      description: 'Learn what coding is and meet your first program',
      videoUrl: 'https://example.com/intro-video.mp4',
      concepts: ['What is coding?', 'Programs and instructions', 'Your first code']
    },
    'loops-1': {
      title: 'Loops Island',
      description: 'Discover the magic of repeating actions',
      videoUrl: 'https://example.com/loops-video.mp4',
      concepts: ['Repetition in code', 'For loops', 'While loops', 'Loop conditions']
    },
    'variables-1': {
      title: 'Variables Valley',
      description: 'Learn to store and use information',
      videoUrl: 'https://example.com/variables-video.mp4',
      concepts: ['Storing information', 'Numbers and text', 'Variable names', 'Using variables']
    }
  };

  const module = moduleData[moduleId as keyof typeof moduleData] || moduleData['basics-1'];

  const handleStepComplete = async () => {
    const steps: Array<typeof currentStep> = ['intro', 'video', 'coding', 'quiz', 'build'];
    const currentIndex = steps.indexOf(currentStep);
    
    // Trigger celebration for major milestones
    if (currentStep === 'coding' && selectedMascot) {
      try {
        const celebrationMessage = await celebrate('Completed first coding exercise!', moduleId);
        if (celebrationMessage) {
          setAiMascotMessage(celebrationMessage);
        }
      } catch (error) {
        // Fallback to static celebration
      }
    }
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const renderMascotMessage = (message?: string) => {
    if (!selectedMascot) return null;
    
    // Use AI message if available, otherwise fallback to provided message or loading state
    const displayMessage = message || aiMascotMessage || (isLoadingMessage ? "Let me think..." : getRandomPhrase(selectedMascot, 'greeting'));
    
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex items-start space-x-4">
        <img
          src={selectedMascot.avatar.expressions.happy}
          alt={selectedMascot.name}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex-1">
          <div className="bg-blue-50 p-3 rounded-lg relative">
            <div className="absolute left-0 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-blue-50 -translate-x-2"></div>
            <p className="text-gray-800">
              {isLoadingMessage ? (
                <span className="flex items-center">
                  <span className="animate-pulse">⚙️</span>
                  <span className="ml-2">{displayMessage}</span>
                </span>
              ) : (
                displayMessage
              )}
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-1">{selectedMascot.name}</p>
        </div>
      </div>
    );
  };

  const renderIntroStep = () => (
    <div>
      {selectedMascot && renderMascotMessage()}
      
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{module.title}</h1>
        <p className="text-gray-600 text-lg mb-6">{module.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">What you'll learn:</h3>
            <ul className="space-y-2">
              {module.concepts.map((concept, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                    {index + 1}
                  </span>
                  {concept}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Today's Adventure</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📹</span>
                <span>Watch introduction video</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">�</span>
                <span>Interactive coding practice</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">📝</span>
                <span>Quick knowledge check</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚙️</span>
                <span>Build a mini project</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleStepComplete}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          Start Learning!
        </button>
      </div>
    </div>
  );

  const renderVideoStep = () => (
    <div>
      {selectedMascot && renderMascotMessage()}
      
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Introduction Video</h2>
        
        <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">�️</div>
            <p className="text-gray-600">Video player would be here</p>
            <p className="text-sm text-gray-500">URL: {module.videoUrl}</p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('intro')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleStepComplete}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Continue to Coding →
          </button>
        </div>
      </div>
    </div>
  );

  const renderCodingStep = () => (
    <div>
      {selectedMascot && renderMascotMessage()}
      
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Interactive Coding</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700">
                Let's create a simple program that displays "Hello, World!" on the screen.
                This is a tradition for all new programmers!
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                <span className="text-gray-700">Click the blocks below</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                <span className="text-gray-700">Drag them to the workspace</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                <span className="text-gray-700">Run your program!</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Code Editor</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-48 font-mono text-sm">
              <div className="mb-2"># Your code will appear here</div>
              <div className="text-yellow-400">print("Hello, World!")</div>
              <div className="mt-4 text-white">Output: Hello, World!</div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors">
                ▶ Run Code
              </button>
              <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep('video')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleStepComplete}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Continue to Quiz →
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuizStep = () => (
    <div>
      {selectedMascot && renderMascotMessage()}
      
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🧠 Knowledge Check</h2>
        
        <div className="space-y-6">
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Question 1: What does the print() function do?
            </h3>
            <div className="space-y-2">
              {[
                'Displays text on the screen',
                'Deletes files from computer',
                'Prints documents on paper',
                'Saves the program'
              ].map((option, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input type="radio" name="q1" className="mr-3" />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Question 2: Which is a correct way to display "Hello" in Python?
            </h3>
            <div className="space-y-2">
              {[
                'print("Hello")',
                'show("Hello")',
                'display("Hello")',
                'hello()'
              ].map((option, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input type="radio" name="q2" className="mr-3" />
                  <span className="text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep('coding')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleStepComplete}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Continue to Project →
          </button>
        </div>
      </div>
    </div>
  );

  const renderBuildStep = () => (
    <div>
      {selectedMascot && renderMascotMessage()}
      
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Build Your Project</h2>
        
        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Project: Personal Greeting</h3>
          <p className="text-gray-700 mb-4">
            Create a program that asks for your name and gives you a personalized greeting!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ask user for their name</li>
                <li>• Display a custom greeting</li>
                <li>• Add a fun element</li>
                <li>• Make it colorful!</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Example Output:</h4>
              <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
                <div>What's your name? Alice</div>
                <div>Hello Alice! Welcome!</div>
                <div>Welcome to coding!</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Game Builder</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">⚙️</div>
                <p>Drag blocks here to build your game</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Preview</h3>
            <div className="bg-gray-900 text-white p-4 rounded-lg h-64 overflow-auto">
              <div className="text-green-400 mb-2">$ Running your program...</div>
              <div className="text-white">What's your name? </div>
              <div className="text-yellow-400">User types: Alex</div>
              <div className="text-white">Hello Alex! Welcome!</div>
              <div className="text-white">Welcome to coding!</div>
              <div className="text-green-400 mt-4">✓ Program completed successfully!</div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep('quiz')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={async () => {
              // Complete module logic with AI celebration
              if (selectedMascot) {
                try {
                  const celebrationMessage = await celebrate(`Completed ${module.title} module!`, moduleId);
                  if (celebrationMessage) {
                    setAiMascotMessage(celebrationMessage);
                  }
                } catch (error) {
                  // Fallback celebration
                }
              }
              alert('Module completed! Great job!');
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Complete Module!
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Module Progress</span>
          <span className="text-sm text-gray-600">
            {['intro', 'video', 'coding', 'quiz', 'build'].indexOf(currentStep) + 1} of 5
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${((['intro', 'video', 'coding', 'quiz', 'build'].indexOf(currentStep) + 1) / 5) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Current step content */}
      {currentStep === 'intro' && renderIntroStep()}
      {currentStep === 'video' && renderVideoStep()}
      {currentStep === 'coding' && renderCodingStep()}
      {currentStep === 'quiz' && renderQuizStep()}
      {currentStep === 'build' && renderBuildStep()}

      {/* AI Mascot Chat - Always available for help */}
      {selectedMascot && (
        <AIMascotChat
          moduleId={moduleId}
          currentStep={currentStep}
          mascotName={selectedMascot.name}
          onMessageSent={(message, response) => {
            // Optional: Track conversation analytics or update UI
          }}
        />
      )}
    </div>
  );
};

export default ModuleIntroduction;
