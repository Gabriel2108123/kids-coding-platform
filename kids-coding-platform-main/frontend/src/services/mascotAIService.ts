// AI Service for Mascot Interactions
// This service can be easily integrated with OpenAI, Anthropic, or other AI providers

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'mock';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface AIResponse {
  text: string;
  confidence: number;
  processingTime: number;
}

export interface LearningContext {
  userId: string;
  userName: string;
  currentPage: string;
  userLevel: number;
  recentModules: string[];
  currentModule?: string;
  strugglingTopics?: string[];
  preferredLearningStyle?: string;
}

class MascotAIService {
  private config: AIServiceConfig;
  private systemPrompt: string;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.systemPrompt = this.buildSystemPrompt();
  }

  private buildSystemPrompt(): string {
    return `You are Bugsby, a friendly and encouraging AI coding companion for children learning programming. 

PERSONALITY TRAITS:
- Extremely patient and encouraging
- Uses age-appropriate language
- Breaks down complex concepts into simple steps
- Celebrates small wins and progress
- Never makes children feel bad about mistakes
- Uses positive reinforcement consistently

GUIDELINES:
- Keep responses concise (1-3 sentences max)
- Use encouraging language ("Great question!", "You're doing awesome!", "Let's figure this out together!")
- Provide specific, actionable help when asked
- Use simple analogies and examples
- Encourage experimentation and creativity
- Always end with encouragement or a positive note
- Avoid technical jargon unless necessary, then explain it simply
- Use emojis sparingly and appropriately

SAFETY RULES:
- Only discuss coding, programming, and learning topics
- Redirect non-coding questions back to programming learning
- Never provide personal information
- Encourage asking parents/teachers for non-coding help

Remember: You're here to make coding fun, accessible, and confidence-building for young learners!`;
  }

  async getResponse(
    userMessage: string, 
    context: LearningContext
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      let responseText: string;

      switch (this.config.provider) {
        case 'openai':
          responseText = await this.getOpenAIResponse(userMessage, context);
          break;
        case 'anthropic':
          responseText = await this.getAnthropicResponse(userMessage, context);
          break;
        case 'mock':
        default:
          responseText = await this.getMockResponse(userMessage, context);
          break;
      }

      const processingTime = Date.now() - startTime;

      return {
        text: responseText,
        confidence: 0.9, // Would be provided by real AI service
        processingTime
      };
    } catch (error) {
      // Fallback to encouraging response
      return {
        text: "I'm having a little trouble right now, but I believe in you! Keep coding and don't give up! 🌟",
        confidence: 0.5,
        processingTime: Date.now() - startTime
      };
    }
  }

  private async getOpenAIResponse(userMessage: string, context: LearningContext): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.systemPrompt + this.buildContextPrompt(context)
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || this.getFallbackResponse(userMessage, context);
  }

  private async getAnthropicResponse(userMessage: string, context: LearningContext): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `${this.systemPrompt}\n\n${this.buildContextPrompt(context)}\n\nUser: ${userMessage}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text || this.getFallbackResponse(userMessage, context);
  }

  private async getMockResponse(userMessage: string, context: LearningContext): Promise<string> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware responses based on current page and learning context
    if (context.currentPage === 'learn' && (lowerMessage.includes('help') || lowerMessage.includes('explain'))) {
      return `Hi ${context.userName}! I'd love to help you understand this concept. Let's break it down into smaller steps - what specific part seems tricky? 🤔`;
    }
    
    if (context.currentPage === 'build' && lowerMessage.includes('idea')) {
      const suggestions = [
        "How about building a simple story game where choices change the ending?",
        "You could create a virtual pet that responds to different commands!",
        "Try making a drawing program where you can create digital art!",
        "Build a quiz game about your favorite topic!"
      ];
      return `${suggestions[Math.floor(Math.random() * suggestions.length)]} What sounds interesting to you? 🎨`;
    }
    
    if (context.currentPage === 'quiz' && (lowerMessage.includes('stuck') || lowerMessage.includes('hint'))) {
      return `No worries ${context.userName}! When I'm stuck on a question, I like to read it slowly and think about what we learned recently. Take your time - you've got this! 💪`;
    }
    
    // Error/debugging help
    if (lowerMessage.includes('error') || lowerMessage.includes('bug') || lowerMessage.includes('broken')) {
      return "Bugs are totally normal! Even the best programmers deal with them every day. Try checking your spelling and making sure all your brackets match. You're learning exactly like a real coder! 🐛➡️✨";
    }
    
    // Difficulty/frustration
    if (lowerMessage.includes('hard') || lowerMessage.includes('difficult') || lowerMessage.includes('frustrated')) {
      return `I understand it feels challenging right now, ${context.userName}. Remember, every amazing programmer started exactly where you are! Take a little break if you need to, then come back fresh. You're doing better than you think! 🌟`;
    }
    
    // Progress questions
    if (lowerMessage.includes('next') || lowerMessage.includes('what should i')) {
      return `You're making such great progress! Based on where you are now, I think you're ready to keep exploring. Try the next lesson or experiment with what you've learned. Coding is all about trying new things! 🚀`;
    }
    
    // Encouragement requests
    if (lowerMessage.includes('encourage') || lowerMessage.includes('motivation')) {
      const encouragements = [
        `${context.userName}, you're absolutely crushing it! Every line of code you write makes you a better programmer! 🎉`,
        `I'm so proud of how hard you're working! You have the curiosity and determination of a real coder! 💯`,
        `You're learning one of the most valuable skills in the world, and you're doing it with such enthusiasm! Keep going! ⭐`,
        `Every question you ask shows you're thinking deeply about coding. That's exactly what great programmers do! 🧠`
      ];
      return encouragements[Math.floor(Math.random() * encouragements.length)];
    }
    
    // General positive responses
    const generalResponses = [
      `That's a fantastic question, ${context.userName}! You're thinking like a real programmer by asking for help when you need it. 🤝`,
      `I love how curious you are about coding! That curiosity is going to help you build amazing things. What else can I help you with? 💭`,
      `You're making incredible progress in your coding journey! Remember, every expert was once a beginner just like you. 📈`,
      `Great job reaching out! The best coders know when to ask questions. What's on your coding mind today? 🎯`,
      `I can see you're really thinking deeply about this. That kind of thoughtful approach is what makes great programmers! 🏆`
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }

  private buildContextPrompt(context: LearningContext): string {
    return `
CURRENT CONTEXT:
- Student: ${context.userName} (Level ${context.userLevel})
- Current Page: ${context.currentPage}
- Current Module: ${context.currentModule || 'None'}
- Recent Modules: ${context.recentModules.join(', ') || 'None yet'}
- Struggling Topics: ${context.strugglingTopics?.join(', ') || 'None identified'}

Tailor your response to their current learning context and level.`;
  }

  private getFallbackResponse(userMessage: string, context: LearningContext): string {
    const fallbacks = [
      `Great question, ${context.userName}! I'm here to help you succeed in your coding journey! 🌟`,
      `You're doing amazing work! Keep exploring and experimenting - that's how the best coders learn! 🚀`,
      `I believe in you! Every challenge you face is making you a stronger programmer! 💪`,
      `You've got this! Remember, coding is all about practice and patience. You're on the right track! ⭐`
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Method to update configuration (useful for switching AI providers)
  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Method to check if service is properly configured
  isConfigured(): boolean {
    return this.config.provider === 'mock' || Boolean(this.config.apiKey);
  }
}

// Export singleton instance
export const mascotAI = new MascotAIService({
  provider: 'mock', // Start with mock, can be changed to 'openai' or 'anthropic'
  // apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Uncomment when ready to use real AI
  // model: 'gpt-3.5-turbo'
});

export default MascotAIService;
