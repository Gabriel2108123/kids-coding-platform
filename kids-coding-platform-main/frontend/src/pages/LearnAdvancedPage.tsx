import React, { useState, useEffect } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ChildProfile } from '../types/family';

interface AdvancedModule {
  id: string;
  title: string;
  description: string;
  content: {
    video?: string;
    text: string;
    codeExamples: {
      title: string;
      code: string;
      explanation: string;
    }[];
  };
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  codingChallenge: {
    title: string;
    description: string;
    initialCode: string;
    hints: string[];
    solution: string;
  };
  prerequisites: string[];
  estimatedTime: number; // in minutes
  difficulty: 'intermediate' | 'advanced';
  tags: string[];
  isCompleted: boolean;
  isUnlocked: boolean;
  ageGroup: 'middle_school' | 'early_teen';
}

type LessonStep = 'overview' | 'content' | 'quiz' | 'challenge' | 'complete';

const LearnAdvancedPage: React.FC = () => {
  const { currentUser, userType } = useFamilyAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<AdvancedModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<AdvancedModule | null>(null);
  const [currentStep, setCurrentStep] = useState<LessonStep>('overview');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [currentCodeExample, setCurrentCodeExample] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [codeOutput, setCodeOutput] = useState('');

  // Type guard for child user
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;

  useEffect(() => {
    // Mock data - replace with API call
    const mockModules: AdvancedModule[] = [
      {
        id: 'advanced-1',
        title: 'Variables and Data Types',
        description: 'Master the fundamentals of storing and using data in programming',
        content: {
          video: '/videos/variables-advanced.mp4',
          text: `
            <h2>Understanding Variables</h2>
            <p>Variables are like labeled containers that store data. In programming, we use different types of variables to hold different kinds of information:</p>
            
            <h3>Common Data Types:</h3>
            <ul>
              <li><strong>Numbers:</strong> Used for mathematical calculations (e.g., age = 15)</li>
              <li><strong>Text (Strings):</strong> Used for words and sentences (e.g., name = "Alex")</li>
              <li><strong>True/False (Booleans):</strong> Used for yes/no decisions (e.g., isStudent = true)</li>
              <li><strong>Lists (Arrays):</strong> Used to store multiple items (e.g., colors = ["red", "blue", "green"])</li>
            </ul>
            
            <h3>Why Variables Matter</h3>
            <p>Variables make our programs flexible. Instead of hard-coding values, we can store them in variables and change them as needed. This makes our code reusable and easier to maintain.</p>
          `,
          codeExamples: [
            {
              title: 'Creating Variables',
              code: `// Number variable
let age = 15;

// String variable  
let name = "Alex";

// Boolean variable
let isStudent = true;

// Array variable
let subjects = ["Math", "Science", "History"];

console.log("Name:", name);
console.log("Age:", age);`,
              explanation: 'This example shows how to create different types of variables and use them in your code.'
            },
            {
              title: 'Using Variables in Calculations',
              code: `let width = 10;
let height = 5;
let area = width * height;

console.log("Rectangle area:", area);

// Variables can change
width = 15;
area = width * height;
console.log("New area:", area);`,
              explanation: 'Variables can be used in calculations and their values can be updated throughout your program.'
            }
          ]
        },
        quiz: [
          {
            question: "What type of variable would you use to store someone's name?",
            options: ["Number", "String", "Boolean", "Array"],
            correctAnswer: 1,
            explanation: "A string is used to store text data like names."
          },
          {
            question: "If you want to store a list of your favorite movies, which data type would you use?",
            options: ["Number", "String", "Boolean", "Array"],
            correctAnswer: 3,
            explanation: "An array is perfect for storing multiple items in a list."
          },
          {
            question: "What happens when you change the value of a variable?",
            options: ["The program breaks", "All previous values are kept", "The old value is replaced", "Nothing happens"],
            correctAnswer: 2,
            explanation: "When you assign a new value to a variable, it replaces the old value."
          }
        ],
        codingChallenge: {
          title: 'Personal Profile Creator',
          description: 'Create variables to store information about yourself and display them in a formatted way.',
          initialCode: `// Create variables for your personal information
let firstName = "";
let lastName = "";
let age = 0;
let favoriteSubjects = [];
let hasPhone = false;

// Your code here: Set values for all variables above

// Display the information (don't change this part)
console.log("=== My Profile ===");
console.log("Name: " + firstName + " " + lastName);
console.log("Age: " + age);
console.log("Favorite subjects: " + favoriteSubjects.join(", "));
console.log("Has phone: " + hasPhone);`,
          hints: [
            "Fill in your real information for firstName and lastName",
            "Set your actual age as a number",
            "Add at least 3 subjects to the favoriteSubjects array",
            "Set hasPhone to true or false based on whether you have a phone"
          ],
          solution: `let firstName = "Alex";
let lastName = "Johnson";
let age = 14;
let favoriteSubjects = ["Math", "Science", "Art"];
let hasPhone = true;`
        },
        prerequisites: [],
        estimatedTime: 25,
        difficulty: 'intermediate',
        tags: ['fundamentals', 'data-types', 'variables'],
        isCompleted: false,
        isUnlocked: true,
        ageGroup: 'middle_school'
      },
      {
        id: 'advanced-2',
        title: 'Functions and Parameters', 
        description: 'Learn to create reusable code with functions and parameters',
        content: {
          video: '/videos/functions-advanced.mp4',
          text: `
            <h2>Understanding Functions</h2>
            <p>Functions are like recipes in programming. They're reusable blocks of code that perform specific tasks. Instead of writing the same code over and over, you can create a function and call it whenever needed.</p>
            
            <h3>Why Use Functions?</h3>
            <ul>
              <li><strong>Reusability:</strong> Write once, use many times</li>
              <li><strong>Organization:</strong> Break complex problems into smaller pieces</li>
              <li><strong>Maintenance:</strong> Fix bugs in one place instead of many</li>
              <li><strong>Readability:</strong> Make code easier to understand</li>
            </ul>
            
            <h3>Parameters and Arguments</h3>
            <p>Parameters are like ingredients in a recipe - they're placeholders for values that the function needs to work with. Arguments are the actual values you pass to the function when you call it.</p>
          `,
          codeExamples: [
            {
              title: 'Basic Function',
              code: `function greetUser() {
    console.log("Hello, welcome to our app!");
}

// Call the function
greetUser();`,
              explanation: 'This is a simple function that displays a greeting message when called.'
            },
            {
              title: 'Function with Parameters',
              code: `function greetPerson(name, age) {
    console.log("Hello, " + name + "!");
    console.log("You are " + age + " years old.");
}

// Call with different arguments
greetPerson("Alice", 14);
greetPerson("Bob", 16);`,
              explanation: 'This function takes parameters (name and age) and uses them to create personalized greetings.'
            },
            {
              title: 'Function that Returns a Value',
              code: `function calculateArea(width, height) {
    let area = width * height;
    return area;
}

let roomArea = calculateArea(12, 10);
console.log("Room area:", roomArea, "square feet");`,
              explanation: 'This function calculates an area and returns the result, which can be stored in a variable.'
            }
          ]
        },
        quiz: [
          {
            question: "What is the main benefit of using functions?",
            options: ["They make code run faster", "They allow code reuse", "They use less memory", "They are required by the computer"],
            correctAnswer: 1,
            explanation: "Functions allow you to write code once and reuse it many times, making your programs more efficient and easier to maintain."
          },
          {
            question: "What are parameters in a function?",
            options: ["The function's name", "Values the function returns", "Placeholders for input values", "Lines of code in the function"],
            correctAnswer: 2,
            explanation: "Parameters are placeholders that allow a function to accept input values when it's called."
          }
        ],
        codingChallenge: {
          title: 'Calculator Functions',
          description: 'Create functions for basic math operations and use them to solve problems.',
          initialCode: `// Create functions for basic math operations
function add(a, b) {
    // Your code here
}

function multiply(a, b) {
    // Your code here  
}

function calculateCircleArea(radius) {
    // Use multiply function and π (3.14159)
    // Formula: π * radius * radius
}

// Test your functions
console.log("5 + 3 =", add(5, 3));
console.log("4 * 6 =", multiply(4, 6));
console.log("Circle area (radius 5):", calculateCircleArea(5));`,
          hints: [
            "The add function should return a + b",
            "The multiply function should return a * b", 
            "For circle area, use the multiply function to calculate radius * radius",
            "Then multiply that result by π (3.14159)"
          ],
          solution: `function add(a, b) {
    return a + b;
}

function multiply(a, b) {
    return a * b;
}

function calculateCircleArea(radius) {
    return multiply(3.14159, multiply(radius, radius));
}`
        },
        prerequisites: ['advanced-1'],
        estimatedTime: 30,
        difficulty: 'intermediate',
        tags: ['functions', 'parameters', 'organization'],
        isCompleted: false,
        isUnlocked: false,
        ageGroup: 'middle_school'
      }
    ];

    // Redirect if not the right age group
    if (childUser && !['middle_school', 'early_teen'].includes(childUser.ageGroup)) {
      // eslint-disable-next-line no-console
      console.log('Wrong age group for advanced view, redirecting...');
      navigate('/');
      return;
    }
    
    setModules(mockModules);
  }, [childUser, navigate]);

  const handleModuleSelect = (module: AdvancedModule) => {
    if (!module.isUnlocked) return;
    setSelectedModule(module);
    setCurrentStep('overview');
    setQuizAnswers([]);
    setQuizScore(null);
    setShowQuizFeedback(false);
    setCurrentCodeExample(0);
    setUserCode(module.codingChallenge.initialCode);
    setCodeOutput('');
  };

  const handleStepComplete = () => {
    switch (currentStep) {
      case 'overview':
        setCurrentStep('content');
        break;
      case 'content':
        setCurrentStep('quiz');
        break;
      case 'quiz':
        if (!showQuizFeedback) {
          // Calculate and show quiz results
          if (selectedModule?.quiz) {
            const correct = quizAnswers.reduce((count, answer, index) => {
              return answer === selectedModule.quiz[index].correctAnswer ? count + 1 : count;
            }, 0);
            const score = Math.round((correct / selectedModule.quiz.length) * 100);
            setQuizScore(score);
            setShowQuizFeedback(true);
          }
        } else {
          // Move to coding challenge if passed
          if (quizScore && quizScore >= 70) {
            setCurrentStep('challenge');
          }
        }
        break;
      case 'challenge':
        setCurrentStep('complete');
        break;
      case 'complete':
        setSelectedModule(null);
        break;
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleRunCode = () => {
    // Simulate code execution
    try {
      // In a real implementation, this would safely execute the code
      setCodeOutput('Code executed successfully! Check the console for results.');
    } catch (error) {
      setCodeOutput('Error: ' + (error as Error).message);
    }
  };

  if (!childUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-xl text-gray-600">Loading advanced modules...</p>
        </div>
      </div>
    );
  }

  // Module detail view
  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <Header />
        
        <div className="container mx-auto px-4 py-6">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {['overview', 'content', 'quiz', 'challenge', 'complete'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    ${currentStep === step 
                      ? 'bg-indigo-500 text-white' 
                      : index < ['overview', 'content', 'quiz', 'challenge', 'complete'].indexOf(currentStep)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}>
                    {step === 'overview' && '📋'}
                    {step === 'content' && '📚'}
                    {step === 'quiz' && '❓'}
                    {step === 'challenge' && '💻'}
                    {step === 'complete' && '✅'}
                  </div>
                  {index < 4 && (
                    <div className={`w-12 h-1 ${
                      index < ['overview', 'content', 'quiz', 'challenge', 'complete'].indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedModule.title}
              </h1>
              <div className="flex justify-center space-x-4 text-sm text-gray-600">
                <span>⏱️ {selectedModule.estimatedTime} min</span>
                <span>📊 {selectedModule.difficulty}</span>
                <span>🏷️ {selectedModule.tags.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
            {/* Overview Step */}
            {currentStep === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-center">📋 Module Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                    <p className="text-gray-700 mb-4">{selectedModule.description}</p>
                    
                    {selectedModule.prerequisites.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Prerequisites:</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {selectedModule.prerequisites.map((prereq, index) => (
                            <li key={index}>{prereq}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {selectedModule.content.video && (
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🎬</div>
                          <p className="text-gray-600">Preview Video</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <button
                    onClick={handleStepComplete}
                    className="btn bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg"
                  >
                    Start Learning →
                  </button>
                </div>
              </div>
            )}

            {/* Content Step */}
            {currentStep === 'content' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-center">📚 Learn the Concepts</h2>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <div 
                      className="prose prose-lg mb-6"
                      dangerouslySetInnerHTML={{ __html: selectedModule.content.text }}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Code Examples</h3>
                    <div className="space-y-4">
                      {selectedModule.content.codeExamples.map((example, index) => (
                        <div 
                          key={index}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            currentCodeExample === index ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                          }`}
                          onClick={() => setCurrentCodeExample(index)}
                        >
                          <h4 className="font-semibold mb-2">{example.title}</h4>
                          {currentCodeExample === index && (
                            <>
                              <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto mb-3">
                                <code>{example.code}</code>
                              </pre>
                              <p className="text-sm text-gray-600">{example.explanation}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <button
                    onClick={handleStepComplete}
                    className="btn bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
                  >
                    I Understand the Concepts →
                  </button>
                </div>
              </div>
            )}

            {/* Quiz Step */}
            {currentStep === 'quiz' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-center">❓ Knowledge Check</h2>
                
                {!showQuizFeedback ? (
                  <>
                    {selectedModule.quiz.map((question, qIndex) => (
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
                                className="text-indigo-500"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center">
                      {quizAnswers.length === selectedModule.quiz.length ? (
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
                  </>
                ) : (
                  <div>
                    <div className={`text-center p-6 rounded-lg mb-6 ${
                      quizScore && quizScore >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <h3 className="text-2xl font-bold mb-2">Quiz Results</h3>
                      <p className="text-xl">Your Score: {quizScore}%</p>
                      {quizScore && quizScore >= 70 ? (
                        <p>Excellent! You're ready for the coding challenge.</p>
                      ) : (
                        <p>Review the material and try again to achieve 70% or higher.</p>
                      )}
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <h3 className="text-lg font-semibold">Detailed Feedback:</h3>
                      {selectedModule.quiz.map((question, qIndex) => (
                        <div key={qIndex} className="p-4 border rounded-lg">
                          <p className="font-medium mb-2">{qIndex + 1}. {question.question}</p>
                          <p className={`mb-2 ${
                            quizAnswers[qIndex] === question.correctAnswer ? 'text-green-600' : 'text-red-600'
                          }`}>
                            Your answer: {question.options[quizAnswers[qIndex]]} 
                            {quizAnswers[qIndex] === question.correctAnswer ? ' ✓' : ' ✗'}
                          </p>
                          {quizAnswers[qIndex] !== question.correctAnswer && (
                            <p className="text-green-600 mb-2">
                              Correct answer: {question.options[question.correctAnswer]}
                            </p>
                          )}
                          <p className="text-gray-600 text-sm">{question.explanation}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      {quizScore && quizScore >= 70 ? (
                        <button
                          onClick={handleStepComplete}
                          className="btn bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
                        >
                          Continue to Coding Challenge →
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowQuizFeedback(false);
                            setQuizAnswers([]);
                            setQuizScore(null);
                          }}
                          className="btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                        >
                          Retake Quiz
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coding Challenge Step */}
            {currentStep === 'challenge' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-center">💻 Coding Challenge</h2>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{selectedModule.codingChallenge.title}</h3>
                    <p className="text-gray-700 mb-4">{selectedModule.codingChallenge.description}</p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">💡 Hints:</h4>
                      <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                        {selectedModule.codingChallenge.hints.map((hint, index) => (
                          <li key={index}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      onClick={handleRunCode}
                      className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mb-4"
                    >
                      ▶️ Run Code
                    </button>
                    
                    {codeOutput && (
                      <div className="bg-gray-900 text-green-400 p-3 rounded text-sm">
                        <p>Output: {codeOutput}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Your Code:</h4>
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="w-full h-96 p-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                      spellCheck={false}
                    />
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <button
                    onClick={handleStepComplete}
                    className="btn bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg"
                  >
                    Challenge Complete! →
                  </button>
                </div>
              </div>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && (
              <div className="text-center">
                <div className="text-8xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold mb-4">Module Completed!</h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Congratulations! You've mastered "{selectedModule.title}"
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-green-800 mb-2">What you learned:</h3>
                  <ul className="text-green-700 text-sm space-y-1">
                    {selectedModule.tags.map((tag, index) => (
                      <li key={index}>✓ {tag.charAt(0).toUpperCase() + tag.slice(1)}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={handleStepComplete}
                  className="btn bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            🎓 Advanced Programming Modules
          </h1>
          <p className="text-gray-600 text-xl">
            Deep dive into programming concepts with hands-on challenges
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
                      : 'bg-indigo-200 text-indigo-800'
                    }
                  `}>
                    💻
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
                
                <div className="flex justify-center space-x-2 text-xs mb-3">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {module.difficulty}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {module.estimatedTime}min
                  </span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-1">
                  {module.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {module.tags.length > 2 && (
                    <span className="text-gray-500 text-xs">+{module.tags.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnAdvancedPage;
