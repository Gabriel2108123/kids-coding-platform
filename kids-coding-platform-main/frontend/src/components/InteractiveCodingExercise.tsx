import React, { useState, useEffect } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { ChildProfile } from '../types/family';
import { useSound } from '../utils/SoundManager';
import BlocklyEditor from '../editor/BlocklyEditor';
import { FrontendAgeGroup, normalizeAgeGroup } from '../utils/ageGroupUtils';

interface CodingStep {
  id: string;
  title: string;
  instruction: string;
  hint?: string;
  expectedBlocks?: string[];
  targetCode?: string;
  completed: boolean;
  isActive: boolean;
}

interface CodingExercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageGroup: FrontendAgeGroup;
  concept: string;
  steps: CodingStep[];
  totalXP: number;
  badge?: string;
}

interface InteractiveCodingExerciseProps {
  exerciseId?: string;
  onComplete?: (exerciseId: string, xpEarned: number) => void;
}

// Sample coding exercises
const exercises: Record<string, CodingExercise> = {
  'intro-variables': {
    id: 'intro-variables',
    title: 'Introduction to Variables',
    description: 'Learn how to store and use values in your programs!',
    difficulty: 'beginner',
    ageGroup: '4-6',
    concept: 'Variables',
    totalXP: 50,
      badge: 'Variable Master',
      steps: [
        {
          id: 'step1',
          title: 'Create Your First Variable',
          instruction: 'Drag a "set variable" block from the Variables category. Name it "score" and set it to 0.',
          hint: 'Look for the orange Variables blocks on the left. The "set variable" block looks like a puzzle piece!',
          expectedBlocks: ['variables_set'],
          targetCode: 'var score = 0;',
          completed: false,
          isActive: true
        },
        {
          id: 'step2',
          title: 'Change Your Variable',
          instruction: 'Now add a "change variable" block to increase the score by 10.',
          hint: 'The "change variable" block lets you add or subtract from your variable.',
          expectedBlocks: ['variables_set', 'math_change'],
          targetCode: 'var score = 0;\nscore = (typeof score == \'number\' ? score : 0) + 10;',
          completed: false,
          isActive: false
        },
        {
          id: 'step3',
          title: 'Show Your Variable',
          instruction: 'Add a "say" block to display your score variable.',
          hint: 'Use the "say" block from the Looks category and connect your variable to it.',
          expectedBlocks: ['variables_set', 'math_change', 'text_print'],
          completed: false,
          isActive: false
        }
      ]
    },
    'loops-intro': {
      id: 'loops-intro',
      title: 'Fun with Loops',
      description: 'Make your code repeat actions automatically!',
      difficulty: 'intermediate',
      ageGroup: '7-10',
      concept: 'Loops',
      totalXP: 75,
      badge: 'Loop Expert',
      steps: [
        {
          id: 'step1',
          title: 'Create a Repeat Loop',
          instruction: 'Drag a "repeat 10 times" block from the Loops category.',
          hint: 'Loops help you do the same thing multiple times without copying blocks!',
          expectedBlocks: ['controls_repeat_ext'],
          completed: false,
          isActive: true
        },
        {
          id: 'step2',
          title: 'Add Actions to Your Loop',
          instruction: 'Put a "move forward" block inside your repeat loop.',
          hint: 'Drag the move block into the repeat block. It should fit like a puzzle piece!',
          expectedBlocks: ['controls_repeat_ext', 'move_forward'],
          completed: false,
          isActive: false
        }
      ]
    }
  };

const InteractiveCodingExercise: React.FC<InteractiveCodingExerciseProps> = ({
  exerciseId = 'intro-variables',
  onComplete
}) => {
  const { currentUser, userType } = useFamilyAuth();
  const { playClick, playSuccess } = useSound();
  
  // Type guard for child user
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;
  
  const [currentExercise, setCurrentExercise] = useState<CodingExercise | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (exerciseId && exercises[exerciseId]) {
      setCurrentExercise(exercises[exerciseId]);
      setCurrentStepIndex(0);
      setProgress(0);
      setIsCompleted(false);
    }
  }, [exerciseId]);

  const handleCodeChange = (code: string, xml: string) => {
    checkStepCompletion(code, xml);
  };

  const checkStepCompletion = (code: string, xml: string) => {
    if (!currentExercise) return;

    const currentStep = currentExercise.steps[currentStepIndex];
    
    // Simple code matching - in a real app, this would be more sophisticated
    const normalizedCode = code.toLowerCase().replace(/\s+/g, '');
    const expectedCode = currentStep.targetCode?.toLowerCase().replace(/\s+/g, '') || '';
    
    // Check if the generated code contains expected patterns
    const isStepComplete = expectedCode ? normalizedCode.includes(expectedCode.split('\n')[0]) : 
                          currentStep.expectedBlocks?.some(block => xml.includes(block)) || false;

    if (isStepComplete && !currentStep.completed) {
      // Mark step as completed
      const updatedExercise = { ...currentExercise };
      updatedExercise.steps[currentStepIndex].completed = true;
      
      // Play success sound
      playSuccess();
      
      // Move to next step or complete exercise
      if (currentStepIndex < updatedExercise.steps.length - 1) {
        const nextIndex = currentStepIndex + 1;
        updatedExercise.steps[nextIndex].isActive = true;
        setCurrentStepIndex(nextIndex);
        setCurrentExercise(updatedExercise);
        
        // Update progress
        const newProgress = ((nextIndex) / updatedExercise.steps.length) * 100;
        setProgress(newProgress);
      } else {
        // Exercise completed!
        setIsCompleted(true);
        setProgress(100);
        onComplete?.(currentExercise.id, currentExercise.totalXP);
      }
    }
  };

  const handleNextStep = () => {
    if (currentExercise && currentStepIndex < currentExercise.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const updatedExercise = { ...currentExercise };
      updatedExercise.steps[nextIndex].isActive = true;
      setCurrentExercise(updatedExercise);
      playClick();
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      playClick();
    }
  };

  const handleShowHint = () => {
    setShowHint(!showHint);
    playClick();
  };

  const handleRestart = () => {
    if (currentExercise) {
      const resetExercise = { ...currentExercise };
      resetExercise.steps.forEach((step, index) => {
        step.completed = false;
        step.isActive = index === 0;
      });
      setCurrentExercise(resetExercise);
      setCurrentStepIndex(0);
      setProgress(0);
      setIsCompleted(false);
      setShowHint(false);
      playClick();
    }
  };

  if (!currentExercise) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  const currentStep = currentExercise.steps[currentStepIndex];

  return (
    <div className="interactive-coding-exercise h-full bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6 rounded-t-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{currentExercise.title}</h1>
            <p className="text-gray-600 mt-1">{currentExercise.description}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentExercise.difficulty === 'beginner' ? 'bg-green-100 text-green-600' :
                currentExercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {currentExercise.difficulty}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                {currentExercise.concept}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                {currentExercise.totalXP} XP
              </span>
            </div>
          </div>
          
          <button
            onClick={handleRestart}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🔄 Restart
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-sm text-gray-600">
          Step {currentStepIndex + 1} of {currentExercise.steps.length}
        </div>
      </div>

      <div className="flex h-full">
        {/* Step Instructions */}
        <div className="w-1/3 bg-white p-6 border-r border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              {currentStep.completed ? '✅' : '🎯'} {currentStep.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">{currentStep.instruction}</p>
          </div>

          {/* Hint Section */}
          {currentStep.hint && (
            <div className="mb-6">
              <button
                onClick={handleShowHint}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                💡 {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              {showHint && (
                <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">{currentStep.hint}</p>
                </div>
              )}
            </div>
          )}

          {/* Step Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={handlePreviousStep}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === currentExercise.steps.length - 1 || !currentStep.completed}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>

          {/* Steps Overview */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">All Steps:</h3>
            <div className="space-y-2">
              {currentExercise.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${
                    index === currentStepIndex ? 'bg-blue-50 border border-blue-200' :
                    step.completed ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                  onClick={() => setCurrentStepIndex(index)}
                >
                  <span className="text-lg">
                    {step.completed ? '✅' : index === currentStepIndex ? '🎯' : '⭕'}
                  </span>
                  <span className={`text-sm ${
                    index === currentStepIndex ? 'font-semibold text-blue-700' :
                    step.completed ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blockly Editor */}
        <div className="flex-1 p-6">
          <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
            <BlocklyEditor
              onChange={handleCodeChange}
              ageGroup={normalizeAgeGroup(childUser?.ageGroup).frontend}
              availableBlocks={currentStep.expectedBlocks}
            />
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl text-center max-w-md mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Exercise Complete!</h2>
            <p className="text-gray-600 mb-4">
              You've mastered {currentExercise.concept}! 
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
              <p className="text-lg font-semibold text-blue-700">
                +{currentExercise.totalXP} XP Earned!
              </p>
              {currentExercise.badge && (
                <p className="text-sm text-purple-600 mt-1">
                  🏆 Badge Unlocked: {currentExercise.badge}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => setIsCompleted(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCodingExercise;
