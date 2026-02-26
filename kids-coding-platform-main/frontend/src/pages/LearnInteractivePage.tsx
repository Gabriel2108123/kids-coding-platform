import React, { useState, useEffect } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ChildProfile } from '../types/family';

interface InteractiveModule {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  textContent: string;
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  codePracticeId?: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  difficulty: 'beginner' | 'intermediate';
  ageGroup: 'elementary';
}

type LessonStep = 'video' | 'reading' | 'quiz' | 'coding' | 'complete';

const LearnInteractivePage: React.FC = () => {
  const { currentUser, userType } = useFamilyAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<InteractiveModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<InteractiveModule | null>(null);
  const [currentStep, setCurrentStep] = useState<LessonStep>('video');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Type guard for child user
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;

  useEffect(() => {
    // Mock data - replace with API call
    const mockModules: InteractiveModule[] = [
      {
        id: 'interactive-1',
        title: 'Sequences and Steps',
        description: 'Learn how computers follow step-by-step instructions!',
        videoUrl: '/videos/sequences.mp4',
        textContent: `
          <h2>What are Sequences?</h2>
          <p>A sequence is a list of steps that happen in order. Just like when you brush your teeth:</p>
          <ol>
            <li>Put toothpaste on the brush</li>
            <li>Brush your teeth</li>
            <li>Rinse your mouth</li>
          </ol>
          <p>Computers need sequences too! They follow our instructions step by step.</p>
        `,
        quiz: [
          {
            question: "Which comes first when making a sandwich?",
            options: ["Put filling on bread", "Get two slices of bread", "Close the sandwich"],
            correctAnswer: 1
          },
          {
            question: "What is a sequence?",
            options: ["A random list", "Steps in the right order", "Just one step"],
            correctAnswer: 1
          }
        ],
        codePracticeId: 'seq-practice-1',
        isCompleted: false,
        isUnlocked: true,
        difficulty: 'beginner',
        ageGroup: 'elementary'
      },
      {
        id: 'interactive-2', 
        title: 'Loops and Repetition',
        description: 'Discover how to make computers repeat actions!',
        videoUrl: '/videos/loops.mp4',
        textContent: `
          <h2>What are Loops?</h2>
          <p>Sometimes we need to do the same thing many times. Instead of writing the same instruction over and over, we use loops!</p>
          <p>For example: "Clap your hands 5 times" - that's a loop!</p>
        `,
        quiz: [
          {
            question: "If you want to draw 3 circles, what's the best way?",
            options: ["Draw circle, draw circle, draw circle", "Use a loop to repeat 'draw circle' 3 times", "Draw one big circle"],
            correctAnswer: 1
          }
        ],
        codePracticeId: 'loop-practice-1',
        isCompleted: false,
        isUnlocked: false,
        difficulty: 'beginner',
        ageGroup: 'elementary'
      }
    ];

    // Redirect if not the right age group
    if (childUser && childUser.ageGroup !== 'elementary') {
      // eslint-disable-next-line no-console
      console.log('Wrong age group for interactive view, redirecting...');
      navigate('/');
      return;
    }
    
    setModules(mockModules);
  }, [childUser, navigate]);

  const handleModuleSelect = (module: InteractiveModule) => {
    if (!module.isUnlocked) return;
    setSelectedModule(module);
    setCurrentStep('video');
    setQuizAnswers([]);
    setQuizScore(null);
  };

  const handleStepComplete = () => {
    switch (currentStep) {
      case 'video':
        setCurrentStep('reading');
        break;
      case 'reading':
        setCurrentStep('quiz');
        break;
      case 'quiz':
        // Calculate quiz score
        if (selectedModule?.quiz) {
          const correct = quizAnswers.reduce((count, answer, index) => {
            return answer === selectedModule.quiz![index].correctAnswer ? count + 1 : count;
          }, 0);
          const score = Math.round((correct / selectedModule.quiz.length) * 100);
          setQuizScore(score);
          
          if (score >= 70) {
            setCurrentStep(selectedModule.codePracticeId ? 'coding' : 'complete');
          }
        }
        break;
      case 'coding':
        setCurrentStep('complete');
        break;
      case 'complete':
        // Mark module as complete and return to module list
        // In real implementation, this would call an API
        setSelectedModule(null);
        break;
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  if (!childUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-xl text-gray-600">Loading your lessons...</p>
        </div>
      </div>
    );
  }

  // Module detail view
  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        
        <div className="container mx-auto px-4 py-6">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {['video', 'reading', 'quiz', 'coding', 'complete'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${currentStep === step 
                      ? 'bg-blue-500 text-white' 
                      : index < ['video', 'reading', 'quiz', 'coding', 'complete'].indexOf(currentStep)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}>
                    {step === 'video' && '📹'}
                    {step === 'reading' && '📚'}
                    {step === 'quiz' && '❓'}
                    {step === 'coding' && '💻'}
                    {step === 'complete' && '✅'}
                  </div>
                  {index < 4 && (
                    <div className={`w-8 h-1 ${
                      index < ['video', 'reading', 'quiz', 'coding', 'complete'].indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <h1 className="text-3xl font-bold text-center text-gray-800">
              {selectedModule.title}
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            {/* Video Step */}
            {currentStep === 'video' && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">📹 Watch the Video</h2>
                <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-gray-600">Video: {selectedModule.videoUrl}</p>
                  </div>
                </div>
                <button
                  onClick={handleStepComplete}
                  className="btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                  I Watched the Video! →
                </button>
              </div>
            )}

            {/* Reading Step */}
            {currentStep === 'reading' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-center">📚 Read and Learn</h2>
                <div 
                  className="prose prose-lg mx-auto mb-6"
                  dangerouslySetInnerHTML={{ __html: selectedModule.textContent }}
                />
                <div className="text-center">
                  <button
                    onClick={handleStepComplete}
                    className="btn bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
                  >
                    I Finished Reading! →
                  </button>
                </div>
              </div>
            )}

            {/* Quiz Step */}
            {currentStep === 'quiz' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-center">❓ Quiz Time!</h2>
                {selectedModule.quiz?.map((question, qIndex) => (
                  <div key={qIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <label key={oIndex} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            checked={quizAnswers[qIndex] === oIndex}
                            onChange={() => handleQuizAnswer(qIndex, oIndex)}
                            className="text-blue-500"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                {quizScore !== null && (
                  <div className={`text-center p-4 rounded-lg mb-4 ${
                    quizScore >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <h3 className="text-xl font-bold">Your Score: {quizScore}%</h3>
                    {quizScore >= 70 ? (
                      <p>Great job! You can continue to the next step.</p>
                    ) : (
                      <p>Try reviewing the material and take the quiz again.</p>
                    )}
                  </div>
                )}
                
                <div className="text-center">
                  {quizAnswers.length === selectedModule.quiz?.length ? (
                    <button
                      onClick={handleStepComplete}
                      className="btn bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <p className="text-gray-600">Please answer all questions to continue.</p>
                  )}
                </div>
              </div>
            )}

            {/* Coding Step */}
            {currentStep === 'coding' && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">💻 Practice Coding</h2>
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="text-6xl mb-4">🧩</div>
                  <p className="text-gray-600 mb-4">Block-based coding practice would go here</p>
                  <p className="text-sm text-gray-500">Practice ID: {selectedModule.codePracticeId}</p>
                </div>
                <button
                  onClick={handleStepComplete}
                  className="btn bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
                >
                  I Completed the Practice! →
                </button>
              </div>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && (
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
                <p className="text-gray-600 mb-6">
                  You've completed the "{selectedModule.title}" module!
                </p>
                <button
                  onClick={handleStepComplete}
                  className="btn bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
                >
                  Back to Modules
                </button>
              </div>
            )}

            {/* Back button (except on complete step) */}
            {currentStep !== 'complete' && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  ← Back to Modules
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Module list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            🎓 Interactive Learning Modules
          </h1>
          <p className="text-gray-600 text-xl">
            Watch, read, quiz, and code your way to mastery!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`
                bg-white rounded-xl shadow-lg p-6 transition-all duration-300
                ${module.isUnlocked 
                  ? 'hover:shadow-xl hover:scale-105 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
              onClick={() => handleModuleSelect(module)}
            >
              <div className="text-center">
                <div className="relative">
                  <div className={`
                    w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl
                    ${module.isCompleted 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-blue-200 text-blue-800'
                    }
                  `}>
                    📚
                  </div>
                  {module.isCompleted && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                      ✓
                    </div>
                  )}
                  {!module.isUnlocked && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                      🔒
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {module.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {module.description}
                </p>
                
                <div className="flex justify-center space-x-2 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {module.difficulty}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Interactive
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnInteractivePage;
