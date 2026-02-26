import { Request, Response } from 'express';
import { aiMascotService, AIMascotService } from '../services/aiMascotService';
import { User } from '../models/User';

interface ChatRequest {
  message: string;
  moduleId: string;
  currentStep: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

interface StepMessageRequest {
  moduleId: string;
  step: string;
}

export class MascotController {
  
  /**
   * Get AI-powered chat response from mascot
   */
  static async chat(req: Request, res: Response): Promise<Response> {
    try {
      const { message, moduleId, currentStep, conversationHistory }: ChatRequest = req.body;
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Input validation
      if (!message || !moduleId || !currentStep) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: message, moduleId, currentStep'
        });
      }

      // Get user data for context
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Build context for AI
      const context = {
        childId: userId,
        childName: user.displayName || 'Friend',
        ageGroup: user.ageGroup || '8-10',
        currentLevel: user.progress?.currentLevel || 1,
        moduleId,
        moduleTitle: MascotController.getModuleTitle(moduleId),
        currentStep,
        mascotName: MascotController.getMascotName(user.settings?.learning?.visualPreferences?.[0]),
        mascotPersonality: AIMascotService.getMascotPersonality(user.settings?.learning?.visualPreferences?.[0] || 'robot')
      };

      // Convert conversation history to required format
      const chatHistory = conversationHistory?.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })) || [];

      // Get AI response
      const aiResponse = await aiMascotService.getMascotResponse(
        message,
        context,
        chatHistory
      );

      // Log conversation for analytics (optional)
      console.log(`Mascot chat - User: ${userId}, Module: ${moduleId}, Step: ${currentStep}`);

      return res.json({
        success: true,
        data: {
          response: aiResponse,
          mascotName: context.mascotName,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Mascot chat error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get mascot response',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  /**
   * Get contextual step message from mascot
   */
  static async getStepMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { moduleId, step }: StepMessageRequest = req.body;
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!moduleId || !step) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: moduleId, step'
        });
      }

      // Get user data for context
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Build context
      const context = {
        childId: userId,
        childName: user.displayName || 'Friend',
        ageGroup: user.ageGroup || '8-10',
        currentLevel: user.progress?.currentLevel || 1,
        moduleId,
        moduleTitle: MascotController.getModuleTitle(moduleId),
        currentStep: step,
        mascotName: MascotController.getMascotName(user.settings?.learning?.visualPreferences?.[0]),
        mascotPersonality: AIMascotService.getMascotPersonality(user.settings?.learning?.visualPreferences?.[0] || 'robot')
      };

      // Get step-specific message
      const stepMessage = await aiMascotService.getStepMessage(step, context);

      return res.json({
        success: true,
        data: {
          message: stepMessage,
          mascotName: context.mascotName,
          step,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Mascot step message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get mascot step message',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  /**
   * Get help message when child is stuck
   */
  static async getHelp(req: Request, res: Response): Promise<Response> {
    try {
      const { topic, moduleId, currentStep } = req.body;
      const userId = req.user?._id?.toString();

      if (!userId || !topic) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const context = {
        childId: userId,
        childName: user.displayName || 'Friend',
        ageGroup: user.ageGroup || '8-10',
        currentLevel: user.progress?.currentLevel || 1,
        moduleId: moduleId || 'basics-1',
        moduleTitle: MascotController.getModuleTitle(moduleId || 'basics-1'),
        currentStep: currentStep || 'coding',
        mascotName: MascotController.getMascotName(user.settings?.learning?.visualPreferences?.[0]),
        mascotPersonality: AIMascotService.getMascotPersonality(user.settings?.learning?.visualPreferences?.[0] || 'robot')
      };

      const helpMessage = await aiMascotService.getHelpMessage(topic, context);

      return res.json({
        success: true,
        data: {
          message: helpMessage,
          mascotName: context.mascotName,
          topic,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Mascot help error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get help message'
      });
    }
  }

  /**
   * Get celebration message for achievements
   */
  static async celebrate(req: Request, res: Response): Promise<Response> {
    try {
      const { achievement, moduleId } = req.body;
      const userId = req.user?._id?.toString();

      if (!userId || !achievement) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const context = {
        childId: userId,
        childName: user.displayName || 'Friend',
        ageGroup: user.ageGroup || '8-10',
        currentLevel: user.progress?.currentLevel || 1,
        moduleId: moduleId || 'basics-1',
        moduleTitle: MascotController.getModuleTitle(moduleId || 'basics-1'),
        currentStep: 'celebration',
        mascotName: MascotController.getMascotName(user.settings?.learning?.visualPreferences?.[0]),
        mascotPersonality: AIMascotService.getMascotPersonality(user.settings?.learning?.visualPreferences?.[0] || 'robot')
      };

      const celebrationMessage = await aiMascotService.getCelebrationMessage(achievement, context);

      return res.json({
        success: true,
        data: {
          message: celebrationMessage,
          mascotName: context.mascotName,
          achievement,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Mascot celebration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get celebration message'
      });
    }
  }

  // Helper methods
  private static getModuleTitle(moduleId: string): string {
    const modules = {
      'basics-1': 'Welcome to Coding',
      'loops-1': 'Loops Island',
      'variables-1': 'Variables Valley',
      'functions-1': 'Function Forest',
      'conditionals-1': 'Decision Kingdom'
    };
    return modules[moduleId as keyof typeof modules] || 'Coding Adventure';
  }

  private static getMascotName(mascotId?: string): string {
    const names = {
      'robot': 'CodeBot',
      'dragon': 'Draco',
      'unicorn': 'Sparkle',
      'cat': 'Whiskers',
      'space': 'Cosmo'
    };
    return names[mascotId as keyof typeof names] || 'Buddy';
  }
}
