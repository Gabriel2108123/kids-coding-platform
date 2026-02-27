import { Request, Response } from 'express';
import prisma from '../prisma';
import { aiMascotService, AIMascotService } from '../services/aiMascotService';

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, moduleId, currentStep, conversationHistory } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const context = {
      childId: userId,
      childName: user.firstName || 'Friend',
      ageGroup: user.ageGroup || '8-10',
      currentLevel: user.level || 1,
      moduleId,
      moduleTitle: getModuleTitle(moduleId),
      currentStep,
      mascotName: getMascotName((user.settings as any)?.learning?.visualPreferences?.[0]),
      mascotPersonality: AIMascotService.getMascotPersonality((user.settings as any)?.learning?.visualPreferences?.[0] || 'robot')
    };

    const chatHistory = conversationHistory?.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    })) || [];

    const aiResponse = await aiMascotService.getMascotResponse(message, context, chatHistory);

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
    return res.status(500).json({ success: false, message: 'Failed to get mascot response' });
  }
};

export const getStepMessage = async (req: Request, res: Response) => {
  try {
    const { moduleId, step } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const context = {
      childId: userId,
      childName: user.firstName || 'Friend',
      ageGroup: user.ageGroup || '8-10',
      currentLevel: user.level || 1,
      moduleId,
      moduleTitle: getModuleTitle(moduleId),
      currentStep: step,
      mascotName: getMascotName((user.settings as any)?.learning?.visualPreferences?.[0]),
      mascotPersonality: AIMascotService.getMascotPersonality((user.settings as any)?.learning?.visualPreferences?.[0] || 'robot')
    };

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
    return res.status(500).json({ success: false, message: 'Failed' });
  }
};

export const getHelp = async (req: Request, res: Response) => {
  try {
    const { topic, moduleId, currentStep } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const context = {
      childId: userId,
      childName: user.firstName || 'Friend',
      ageGroup: user.ageGroup || '8-10',
      currentLevel: user.level || 1,
      moduleId: moduleId || 'basics-1',
      moduleTitle: getModuleTitle(moduleId || 'basics-1'),
      currentStep: currentStep || 'coding',
      mascotName: getMascotName((user.settings as any)?.learning?.visualPreferences?.[0]),
      mascotPersonality: AIMascotService.getMascotPersonality((user.settings as any)?.learning?.visualPreferences?.[0] || 'robot')
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
    return res.status(500).json({ success: false, message: 'Failed' });
  }
};

export const celebrate = async (req: Request, res: Response) => {
  try {
    const { achievement, moduleId } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const context = {
      childId: userId,
      childName: user.firstName || 'Friend',
      ageGroup: user.ageGroup || '8-10',
      currentLevel: user.level || 1,
      moduleId: moduleId || 'basics-1',
      moduleTitle: getModuleTitle(moduleId || 'basics-1'),
      currentStep: 'celebration',
      mascotName: getMascotName((user.settings as any)?.learning?.visualPreferences?.[0]),
      mascotPersonality: AIMascotService.getMascotPersonality((user.settings as any)?.learning?.visualPreferences?.[0] || 'robot')
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
    return res.status(500).json({ success: false, message: 'Failed' });
  }
};

const getModuleTitle = (moduleId: string): string => {
  const modules: any = {
    'basics-1': 'Welcome to Coding',
    'loops-1': 'Loops Island',
    'variables-1': 'Variables Valley',
    'functions-1': 'Function Forest',
    'conditionals-1': 'Decision Kingdom'
  };
  return modules[moduleId] || 'Coding Adventure';
};

const getMascotName = (mascotId?: string): string => {
  const names: any = {
    'robot': 'CodeBot',
    'dragon': 'Draco',
    'unicorn': 'Sparkle',
    'cat': 'Whiskers',
    'space': 'Cosmo'
  };
  return names[mascotId as any] || 'Buddy';
};

export default {
  chat,
  getStepMessage,
  getHelp,
  celebrate
};
