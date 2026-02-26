import React, { useState, useEffect } from 'react';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation: string;
  points: number;
  hint?: string; // Optional hint for the mascot to provide
}

interface QuizComponentProps {
  title: string;
  questions: QuizQuestion[];
  onComplete: (score: number, totalPoints: number, answers: { [key: string]: any }) => void;
  onNeedHelp?: (question: QuizQuestion, questionIndex: number) => void; // Callback to communicate with mascot
  timeLimit?: number; // in minutes
  allowRetry?: boolean;
  passingScore?: number; // percentage
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  title,
  questions,
  onComplete,
  onNeedHelp,
  timeLimit,
  allowRetry = true,
  passingScore = 70
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : 0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Calculate total possible points
  useEffect(() => {
    const total = questions.reduce((sum, question) => sum + question.points, 0);
    setTotalPoints(total);
  }, [questions]);

  // Timer effect
  useEffect(() => {
    if (timeLimit && timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLimit && timeRemaining === 0 && !isCompleted) {
      // Submit quiz when time runs out
      setIsCompleted(true);
      
      // Calculate score
      let earnedPoints = 0;
      questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (isAnswerCorrect(question, userAnswer)) {
          earnedPoints += question.points;
        }
      });
      
      const percentage = Math.round((earnedPoints / totalPoints) * 100);
      setScore(percentage);
      setShowResults(true);
      
      onComplete(percentage, earnedPoints, answers);
    }
  }, [timeRemaining, isCompleted, timeLimit, answers, questions, totalPoints, onComplete]);

  const handleAnswerChange = (answer: any) => {
    setCurrentAnswer(answer);
  };

  const handleNextQuestion = () => {
    // Save current answer
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      handleSubmitQuiz(newAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer
      const newAnswers = {
        ...answers,
        [currentQuestion.id]: currentAnswer
      };
      setAnswers(newAnswers);
      
      setCurrentQuestionIndex(prev => prev - 1);
      setCurrentAnswer(answers[questions[currentQuestionIndex - 1].id] || '');
    }
  };

  const handleSubmitQuiz = (finalAnswers = answers) => {
    setIsCompleted(true);
    
    // Calculate score
    let earnedPoints = 0;
    questions.forEach(question => {
      const userAnswer = finalAnswers[question.id];
      if (isAnswerCorrect(question, userAnswer)) {
        earnedPoints += question.points;
      }
    });
    
    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    setScore(percentage);
    setShowResults(true);
    
    onComplete(percentage, earnedPoints, finalAnswers);
  };

  const isAnswerCorrect = (question: QuizQuestion, userAnswer: any): boolean => {
    if (question.type === 'multiple-choice') {
      return userAnswer === question.correctAnswer;
    } else if (question.type === 'true-false') {
      return userAnswer === question.correctAnswer;
    } else if (question.type === 'fill-blank') {
      return userAnswer?.toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim();
    }
    return false;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  currentAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={index}
                  checked={currentAnswer === index}
                  onChange={() => handleAnswerChange(index)}
                  className="sr-only"
                />
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-3">
                  {currentAnswer === index && (
                    <span className="w-3 h-3 rounded-full bg-current"></span>
                  )}
                </span>
                {option}
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option, index) => (
              <label
                key={option}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  currentAnswer === (index === 0)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={index.toString()}
                  checked={currentAnswer === (index === 0)}
                  onChange={() => handleAnswerChange(index === 0)}
                  className="sr-only"
                />
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-3">
                  {currentAnswer === (index === 0) && (
                    <span className="w-3 h-3 rounded-full bg-current"></span>
                  )}
                </span>
                {option}
              </label>
            ))}
          </div>
        );

      case 'fill-blank':
        return (
          <div>
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (showResults) {
    const passed = score >= passingScore;
    
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {passed ? '✅' : '📖'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Quiz Completed!
          </h2>
          <div className={`text-6xl font-bold mb-2 ${
            passed ? 'text-green-600' : 'text-orange-600'
          }`}>
            {score}%
          </div>
          <p className="text-gray-600 mb-6">
            You scored {Object.keys(answers).filter(questionId => 
              isAnswerCorrect(
                questions.find(q => q.id === questionId)!,
                answers[questionId]
              )
            ).length} out of {questions.length} questions correct!
          </p>
          
          <div className="space-y-4">
            {passed ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  Congratulations! You passed the quiz!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Great job understanding the material!
                </p>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 font-semibold">
                  Keep studying! You'll get it next time!
                </p>
                <p className="text-orange-600 text-sm mt-1">
                  You need {passingScore}% to pass. Review the material and try again!
                </p>
              </div>
            )}
            
            {allowRetry && !passed && (
              <button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setCurrentAnswer('');
                  setIsCompleted(false);
                  setShowResults(false);
                  setTimeRemaining(timeLimit ? timeLimit * 60 : 0);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
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
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        
        {timeLimit && (
          <div className={`text-lg font-mono ${
            timeRemaining <= 60 ? 'text-red-600' : 'text-gray-600'
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
            width: `${(currentQuestionIndex / questions.length) * 100}%`
          }}
        ></div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {currentQuestion.question}
          </h3>
          <div className="flex items-center space-x-2">
            {onNeedHelp && (
              <button
                onClick={() => onNeedHelp(currentQuestion, currentQuestionIndex)}
                className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-sm hover:bg-yellow-200 transition-colors flex items-center"
                title="Ask Bugsby for help with this question"
              >
                💡 Ask Bugsby
              </button>
            )}
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {currentQuestion.points} pts
            </span>
          </div>
        </div>
        
        {renderQuestion()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentQuestionIndex === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Previous
        </button>
        
        <button
          onClick={handleNextQuestion}
          disabled={currentAnswer === '' || currentAnswer === null}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentAnswer === '' || currentAnswer === null
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isLastQuestion
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLastQuestion ? 'Submit Quiz' : 'Next'}
        </button>
      </div>

      {/* Question Counter */}
      <div className="mt-6 flex justify-center space-x-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index < currentQuestionIndex
                ? 'bg-green-500'
                : index === currentQuestionIndex
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizComponent;
