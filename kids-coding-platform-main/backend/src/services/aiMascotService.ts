import OpenAI from 'openai';

// Initialize OpenAI with API key from environment - optional service
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key') {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
} else {
    console.log('AI Mascot using fallback responses (AI disabled or not configured)');
}

interface MascotContext {
  childId: string;
  childName: string;
  ageGroup: string;
  currentLevel: number;
  moduleId: string;
  moduleTitle: string;
  currentStep: string;
  mascotName: string;
  mascotPersonality: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIMascotService {
  
  /**
   * Generate system prompt for Bugsby AI mascot based on context
   */
  private generateSystemPrompt(context: MascotContext): string {
    return `You are Bugsby, the friendly AI coding companion for children in Bugsby Coding World. You are the one and only mascot that guides children of ALL ages through their coding journey.

PERSONALITY: Encouraging, patient, wise, and always ready to help children learn and create amazing things. You adapt your communication style to match the child's age while maintaining your core supportive personality.

CONTEXT:
- Child's name: ${context.childName}
- Age group: ${context.ageGroup}
- Current coding level: ${context.currentLevel}
- Current module: ${context.moduleTitle}
- Current step: ${context.currentStep}

GUIDELINES:
1. Always be encouraging, patient, and positive
2. Use age-appropriate language for ${context.ageGroup} age group
3. Keep explanations simple and fun
4. Use emojis and exclamation marks to be engaging
5. When explaining coding concepts, use analogies kids can understand
6. If child seems stuck, give hints rather than direct answers
7. Celebrate small victories and progress
8. Maximum response length: 150 words
9. Never discuss topics unrelated to coding, learning, or encouragement

SAFETY RULES:
- Never ask for or mention personal information
- Keep all conversations focused on learning and coding
- If asked inappropriate questions, gently redirect to coding topics
- Always maintain a positive, educational tone

Your goal is to make coding fun and accessible while building the child's confidence!`;
  }

  /**
   * Get contextual AI response for the mascot
   */
  async getMascotResponse(
    userMessage: string,
    context: MascotContext,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Input validation
      if (!userMessage || userMessage.trim().length === 0) {
        return "Hi there! I'm here to help you with coding. What would you like to learn about? 🤖";
      }

      // Content filtering - basic safety check
      if (this.containsInappropriateContent(userMessage)) {
        return "Let's keep our conversation about coding and learning! What coding question can I help you with? 😊";
      }

      // Build conversation messages
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: this.generateSystemPrompt(context)
        },
        // Include limited conversation history (last 4 messages to stay within token limits)
        ...conversationHistory.slice(-4),
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Call OpenAI API
      if (!openai) {
        throw new Error('OpenAI not initialized');
      }
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 200,
        temperature: 0.8, // Make responses more creative and varied
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0]?.message?.content?.trim();
      
      if (!response) {
        return this.getFallbackResponse(context.currentStep);
      }

      // Post-process response for additional safety
      return this.sanitizeResponse(response);

    } catch (error) {
      console.error('AI Mascot Service Error:', error);
      return this.getFallbackResponse(context.currentStep);
    }
  }

  /**
   * Get contextual mascot message for specific learning steps
   */
  async getStepMessage(
    step: string,
    context: MascotContext
  ): Promise<string> {
    const stepPrompts = {
      intro: `Welcome ${context.childName} to ${context.moduleTitle}! Generate an exciting, age-appropriate introduction that makes them want to start learning. Mention what they'll discover.`,
      video: `Create an encouraging message about watching the introduction video for ${context.moduleTitle}. Make it sound fun and educational.`,
      coding: `Time for hands-on coding! Generate an encouraging message about starting to code in ${context.moduleTitle}. Reassure them that learning coding is fun and that you'll help.`,
      quiz: `${context.childName} has been learning hard! Create a positive message about taking a quiz to check their knowledge. Make it sound fun, not scary.`,
      build: `Project time! Generate an exciting message about building their own project with what they learned in ${context.moduleTitle}. Make it sound like an adventure.`
    };

    const stepPrompt = stepPrompts[step as keyof typeof stepPrompts] || stepPrompts.intro;
    
    // Get AI-enhanced version specific to the step
    try {
      const systemPrompt = this.generateSystemPrompt(context);
      const userPrompt = `${stepPrompt}\n\nModule: ${context.moduleTitle}\nChild's Level: ${context.currentLevel}\nStep: ${step}\n\nRespond as Bugsby with an encouraging, patient, and wise personality. Keep it under 40 words and very encouraging!`;

      if (!openai) {
        throw new Error('OpenAI not initialized');
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 80,
        temperature: 0.8,
      });

      const response = completion.choices[0]?.message?.content?.trim();
      
      if (response) {
        return this.sanitizeResponse(response);
      }
    } catch (error) {
      console.error('AI step message error:', error);
    }

    // Fallback to static messages
    const fallbackMessages = {
      intro: `Ready to start a new adventure, ${context.childName}? I'm so excited to explore ${context.moduleTitle} with you! 🚀`,
      video: `Time to watch and learn! I'll be right here if you have any questions about the video. 📺✨`,
      coding: `This is the fun part - coding time! Don't worry if it seems tricky at first, I believe in you! 💻`,
      quiz: `You've been doing amazing! Let's see what you've learned with this quick quiz. You've got this! 🧠`,
      build: `WOW! Time to create something awesome with your new coding skills! I can't wait to see what you build! 🎮`
    };

    return fallbackMessages[step as keyof typeof fallbackMessages] || fallbackMessages.intro;
  }

  /**
   * Get help message when child is stuck
   */
  async getHelpMessage(
    topic: string,
    context: MascotContext
  ): Promise<string> {
    const helpPrompt = `The child is stuck on: ${topic}. Give them a helpful hint or encouragement without giving away the answer directly.`;
    
    return await this.getMascotResponse(helpPrompt, context);
  }

  /**
   * Get celebration message for achievements
   */
  async getCelebrationMessage(
    achievement: string,
    context: MascotContext
  ): Promise<string> {
    const celebrationPrompt = `The child just achieved: ${achievement}. Give them a celebratory and encouraging message!`;
    
    return await this.getMascotResponse(celebrationPrompt, context);
  }

  /**
   * Basic content filtering
   */
  private containsInappropriateContent(message: string): boolean {
    const inappropriateKeywords = [
      'password', 'personal', 'address', 'phone', 'email',
      'meet', 'location', 'where do you live', 'age',
      // Add more keywords as needed
    ];
    
    const lowerMessage = message.toLowerCase();
    return inappropriateKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Sanitize AI response
   */
  private sanitizeResponse(response: string): string {
    // Remove any potential personal info requests or inappropriate content
    // Add more sanitization rules as needed
    return response
      .replace(/\b(what's your|what is your|tell me your)\s+(name|age|address|phone|email)\b/gi, '')
      .trim();
  }

  /**
   * Fallback responses when AI is unavailable
   */
  private getFallbackResponse(step: string): string {
    const fallbacks = {
      intro: "Hi there! I'm so excited to start this coding adventure with you! 🌟",
      video: "Let's watch this video together! Feel free to ask me questions! 📺",
      coding: "Time to code! Remember, every expert was once a beginner. You've got this! 💻",
      quiz: "Great job learning! Let's see what you remember with this fun quiz! 🧠",
      build: "Amazing work! Now let's build something incredible together! 🎮"
    };

    return fallbacks[step as keyof typeof fallbacks] || fallbacks.intro;
  }

  /**
   * Get mascot personality based on mascot type
   */
  static getMascotPersonality(mascotId: string): string {
    const personalities = {
      'robot': 'Logical, encouraging, loves explaining how things work step by step',
      'dragon': 'Adventurous, brave, makes learning feel like an epic quest',
      'unicorn': 'Magical, creative, makes coding feel like casting spells',
      'cat': 'Playful, curious, loves to explore and discover new things',
      'space': 'Explorer, futuristic, makes learning feel like space exploration'
    };

    return personalities[mascotId as keyof typeof personalities] || 
           'Friendly, encouraging, and always ready to help with coding adventures';
  }
}

export const aiMascotService = new AIMascotService();
