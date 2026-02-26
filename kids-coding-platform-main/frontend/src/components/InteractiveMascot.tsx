import React, { useState, useEffect, useRef } from 'react';
import { mascots } from '../data/mascotData';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import { ChildProfile } from '../types/family';
import { mascotAI, LearningContext } from '../services/mascotAIService';

interface MascotMessage {
  id: string;
  text: string;
  type: 'greeting' | 'help' | 'encouragement' | 'hint' | 'celebration' | 'error';
  timestamp: Date;
  isFromUser: boolean;
}

interface InteractiveMascotProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  context?: string; // Current page/context for contextual help
  autoGreeting?: boolean;
}

const InteractiveMascot: React.FC<InteractiveMascotProps> = ({
  position = 'bottom-right',
  context = 'general',
  autoGreeting = true
}) => {
  const { currentUser, userType } = useFamilyAuth();
  const childUser = userType === 'child' ? currentUser as ChildProfile : null;
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MascotMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mascotExpression, setMascotExpression] = useState<'happy' | 'thinking' | 'excited' | 'encouraging'>('happy');
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get Bugsby mascot data
  const bugsby = mascots.find(m => m.id === 'bugsby') || mascots[0];

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  useEffect(() => {
    if (autoGreeting && childUser && messages.length === 0) {
      // Add initial greeting after a short delay
      setTimeout(() => {
        const greetings = {
          home: [
            `Welcome back, ${childUser?.displayName}! Ready for another coding adventure?`,
            "Hi there! What would you like to explore today?",
            "Great to see you again! I'm here to help with any coding questions!"
          ],
          learn: [
            "Ready to learn something new? I'm here to guide you through it!",
            "Learning time! Don't worry, I'll help you understand everything step by step.",
            "Let's dive into some coding concepts together!"
          ],
          build: [
            "Time to build something amazing! I can help you with ideas and troubleshooting.",
            "Building projects is so much fun! What are you thinking of creating?",
            "Let's bring your ideas to life! I'm here to help with any coding challenges."
          ],
          quiz: [
            "Quiz time! Remember, I'm here if you need hints or explanations.",
            "Don't worry about the quiz - just do your best! I can help if you get stuck.",
            "Let's tackle this quiz together! Feel free to ask me questions."
          ],
          general: bugsby.phrases.greeting
        };

        const contextGreetings = greetings[context as keyof typeof greetings] || greetings.general;
        const greetingText = Array.isArray(contextGreetings) 
          ? contextGreetings[Math.floor(Math.random() * contextGreetings.length)]
          : contextGreetings[0];
        
        addMascotMessage(greetingText, 'greeting');
      }, 1000);
    }
  }, [childUser, autoGreeting, context, messages.length, bugsby.phrases.greeting]);

  useEffect(() => {
    // Scroll to bottom of messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const addMascotMessage = (text: string, type: MascotMessage['type']) => {
    const message: MascotMessage = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date(),
      isFromUser: false
    };
    setMessages(prev => [...prev, message]);
    
    // Set appropriate expression
    const expressionMap = {
      greeting: 'happy' as const,
      help: 'encouraging' as const,
      encouragement: 'excited' as const,
      hint: 'thinking' as const,
      celebration: 'excited' as const,
      error: 'encouraging' as const
    };
    setMascotExpression(expressionMap[type]);
    
    // Animate mascot
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const addUserMessage = (text: string) => {
    const message: MascotMessage = {
      id: Date.now().toString(),
      text,
      type: 'help',
      timestamp: new Date(),
      isFromUser: true
    };
    setMessages(prev => [...prev, message]);
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing
    setIsTyping(true);
    setMascotExpression('thinking');
    
    try {
      // Build learning context for AI
      const learningContext: LearningContext = {
        userId: childUser?._id || 'anonymous',
        userName: childUser?.displayName || 'there',
        currentPage: context,
        userLevel: childUser?.progress?.level || 1,
        recentModules: childUser?.progress?.completedModules || [],
        currentModule: childUser?.progress?.currentModule,
        strugglingTopics: [], // Could be tracked based on quiz performance
        preferredLearningStyle: childUser?.settings?.learning?.difficultyPreference || 'beginner'
      };

      // Get AI response using the service
      const aiResponse = await mascotAI.getResponse(userMessage, learningContext);
      return aiResponse.text;
    } catch (error) {
      // Handle error silently for now
      return "I'm having trouble connecting to my knowledge base right now. But I'm still here to encourage you! You're doing great!";
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage = userInput.trim();
    setUserInput('');
    
    // Add user message
    addUserMessage(userMessage);
    
    // Get AI response
    const response = await getAIResponse(userMessage);
    
    // Add mascot response
    setTimeout(() => {
      addMascotMessage(response, 'help');
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const getQuickHelp = () => {
    const quickHelpMessages = {
      home: "Try exploring the learning modules or building something new!",
      learn: "Take your time reading through each lesson. Practice makes perfect!",
      build: "Start with a simple idea and build it step by step. You can always add more features later!",
      quiz: "Read each question carefully and think about what you've learned. You've got this!",
      general: "I'm here to help with any coding questions or just to cheer you on!"
    };
    
    const helpText = quickHelpMessages[context as keyof typeof quickHelpMessages] || quickHelpMessages.general;
    addMascotMessage(helpText, 'help');
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-200 w-80 h-96 mb-4 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={bugsby.avatar.expressions[mascotExpression]} 
                alt={bugsby.name}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <div>
                <h3 className="font-bold">{bugsby.name}</h3>
                <p className="text-xs opacity-90">Your Coding Guide</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isFromUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={getQuickHelp}
              className="w-full text-left text-xs text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
            >
              💡 Get quick help for this page
            </button>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${bugsby.name} anything...`}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isTyping}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mascot Button */}
      <button
        onClick={toggleChat}
        className={`relative w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
          isAnimating ? 'animate-bounce' : ''
        } ${isOpen ? 'scale-90' : ''}`}
      >
        <img
          src={bugsby.avatar.expressions[mascotExpression]}
          alt={bugsby.name}
          className="w-12 h-12 rounded-full mx-auto object-cover"
        />
        
        {/* Notification Badge */}
        {!isOpen && messages.length === 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            💬
          </div>
        )}
        
        {/* Pulsing Ring Animation */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-20"></div>
      </button>
    </div>
  );
};

export default InteractiveMascot;
