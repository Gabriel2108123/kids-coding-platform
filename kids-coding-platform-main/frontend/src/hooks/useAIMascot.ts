import { useState, useCallback } from 'react';

export interface MascotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MascotContext {
  moduleId: string;
  currentStep: string;
  conversationHistory?: MascotMessage[];
}

export interface MascotResponse {
  success: boolean;
  data?: {
    response: string;
    mascotName: string;
    timestamp: string;
  };
  message?: string;
}

export const useAIMascot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<MascotMessage[]>([]);

  const sendMessage = useCallback(async (
    message: string,
    context: MascotContext
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mascot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
          moduleId: context.moduleId,
          currentStep: context.currentStep,
          conversationHistory: context.conversationHistory || conversationHistory,
        }),
      });

      const result: MascotResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to get mascot response');
      }

      if (result.data) {
        // Update conversation history
        const newHistory: MascotMessage[] = [
          ...conversationHistory,
          {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          },
          {
            role: 'assistant',
            content: result.data.response,
            timestamp: result.data.timestamp,
          },
        ];
        
        setConversationHistory(newHistory);
        return result.data.response;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [conversationHistory]);

  const getStepMessage = useCallback(async (
    moduleId: string,
    step: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mascot/step-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          moduleId,
          step,
        }),
      });

      const result: MascotResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to get step message');
      }

      return result.data?.response || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHelp = useCallback(async (
    topic: string,
    moduleId: string,
    currentStep: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mascot/help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          topic,
          moduleId,
          currentStep,
        }),
      });

      const result: MascotResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to get help message');
      }

      return result.data?.response || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const celebrate = useCallback(async (
    achievement: string,
    moduleId?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mascot/celebrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          achievement,
          moduleId,
        }),
      });

      const result: MascotResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to get celebration message');
      }

      return result.data?.response || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearConversation = useCallback(() => {
    setConversationHistory([]);
    setError(null);
  }, []);

  return {
    sendMessage,
    getStepMessage,
    getHelp,
    celebrate,
    clearConversation,
    conversationHistory,
    isLoading,
    error,
  };
};
