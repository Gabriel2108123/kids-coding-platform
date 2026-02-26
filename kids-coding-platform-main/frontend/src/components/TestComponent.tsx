import React, { useState } from 'react';

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TestComponentProps {
  questions: TestQuestion[];
  onComplete: (score: number, answers: { [key: string]: number }) => void;
  timeLimit?: number; // in seconds
}

const TestComponent: React.FC<TestComponentProps> = ({
  questions,
  onComplete,
  timeLimit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);

  // Timer logic
  React.useEffect(() => {
    if (timeLimit && timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isCompleted, timeLimit]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  };

  const handleNext = () => {
    if (showExplanation) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowExplanation(false);
      } else {
        handleComplete();
      }
    } else {
      setShowExplanation(true);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    const score = calculateScore();
    onComplete(score, answers);
  };

  const calculateScore = () => {
    const correctAnswers = questions.filter((question, index) => 
      answers[question.id] === question.correctAnswer
    ).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show results when completed
  if (isCompleted) {
    const score = calculateScore();
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {score >= 80 ? '✅' : score >= 60 ? '👍' : '📖'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Test Completed!
          </h2>
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {score}%
          </div>
          <p className="text-gray-600 mb-6">
            You got {Object.values(answers).filter((answer, index) => 
              answer === questions[index]?.correctAnswer
            ).length} out of {questions.length} questions correct!
          </p>
          <div className="space-y-2">
            {score >= 80 && (
              <p className="text-green-600 font-semibold">
                Excellent work! You've mastered this topic!
              </p>
            )}
            {score >= 60 && score < 80 && (
              <p className="text-blue-600 font-semibold">
                Good job! You're on the right track!
              </p>
            )}
            {score < 60 && (
              <p className="text-orange-600 font-semibold">
                Keep studying! You'll get it next time!
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">Knowledge Test</h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        
        {timeLimit && (
          <div className={`text-lg font-mono ${
            timeRemaining <= 30 ? 'text-red-600' : 'text-gray-600'
          }`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + (showExplanation ? 1 : 0)) / questions.length) * 100}%`
          }}
        ></div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {currentQuestion.question}
        </h3>

        {/* Answer Options */}
        {!showExplanation && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuestion.id] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={answers[currentQuestion.id] === index}
                  onChange={() => handleAnswerSelect(index)}
                  className="sr-only"
                />
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-3">
                  {answers[currentQuestion.id] === index && (
                    <span className="w-3 h-3 rounded-full bg-current"></span>
                  )}
                </span>
                {option}
              </label>
            ))}
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className={`p-4 rounded-lg border-2 ${
            answers[currentQuestion.id] === currentQuestion.correctAnswer
              ? 'border-green-300 bg-green-50'
              : 'border-red-300 bg-red-50'
          }`}>
            <div className="flex items-center mb-2">
              <span className={`text-lg mr-2 ${
                answers[currentQuestion.id] === currentQuestion.correctAnswer
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {answers[currentQuestion.id] === currentQuestion.correctAnswer ? '✅' : '❌'}
              </span>
              <span className="font-semibold">
                {answers[currentQuestion.id] === currentQuestion.correctAnswer 
                  ? 'Correct!' 
                  : 'Incorrect'
                }
              </span>
            </div>
            {answers[currentQuestion.id] !== currentQuestion.correctAnswer && (
              <p className="text-sm text-gray-700 mb-2">
                Correct answer: {currentQuestion.options[currentQuestion.correctAnswer]}
              </p>
            )}
            <p className="text-sm text-gray-700">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex(prev => prev - 1);
              setShowExplanation(false);
            }
          }}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!showExplanation && answers[currentQuestion.id] === undefined}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showExplanation 
            ? (currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next Question')
            : 'Submit Answer'
          }
        </button>
      </div>
    </div>
  );
};

export default TestComponent;
