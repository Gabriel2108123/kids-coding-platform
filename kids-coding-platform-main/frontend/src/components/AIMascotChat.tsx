import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAIMascot } from '../hooks/useAIMascot';

interface AIMascotChatProps {
  moduleId: string;
  currentStep: string;
  mascotName?: string;
  className?: string;
  onMessageSent?: (message: string, response: string) => void;
}

const AIMascotChat: React.FC<AIMascotChatProps> = ({
  moduleId,
  currentStep,
  mascotName = 'Buddy',
  className = '',
  onMessageSent,
}) => {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    sendMessage,
    getStepMessage,
    conversationHistory,
    isLoading,
    error,
    clearConversation,
  } = useAIMascot();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const handleGetStepMessage = useCallback(async () => {
    try {
      await getStepMessage(moduleId, currentStep);
    } catch (err) {
      // Error is handled by the hook
    }
  }, [getStepMessage, moduleId, currentStep]);

  // Get welcome message when component mounts or step changes
  useEffect(() => {
    if (isOpen && conversationHistory.length === 0) {
      handleGetStepMessage();
    }
  }, [isOpen, currentStep, conversationHistory.length, handleGetStepMessage]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');

    try {
      const response = await sendMessage(userMessage, {
        moduleId,
        currentStep,
        conversationHistory,
      });

      if (response && onMessageSent) {
        onMessageSent(userMessage, response);
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    }
  };

  const handleClearChat = () => {
    clearConversation();
    handleGetStepMessage();
  };

  return (
    <div className={`ai-mascot-chat ${className}`}>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={`
          fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg
          transition-all duration-300 hover:scale-110 z-50
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
          }
        `}
        aria-label={isOpen ? 'Close chat' : `Chat with ${mascotName}`}
      >
        {isOpen ? (
          <span className="text-white text-2xl">×</span>
        ) : (
          <div className="text-white text-2xl">💬</div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-xl z-40">
          {/* Header */}
          <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Chat with {mascotName}</h3>
            <button
              onClick={handleClearChat}
              className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
              title="Clear conversation"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto h-64 space-y-3">
            {conversationHistory.length === 0 && !isLoading && (
              <div className="text-gray-500 text-sm text-center py-8">
                Hi! I'm {mascotName}. Ask me anything about coding! 
              </div>
            )}

            {conversationHistory.map((msg, index) => (
              <div
                key={index}
                className={`
                  flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}
                `}
              >
                <div
                  className={`
                    max-w-xs px-3 py-2 rounded-lg text-sm
                    ${msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-xs text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={chatInputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMascotChat;
