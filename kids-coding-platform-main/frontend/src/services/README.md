# Interactive Mascot AI Integration

This document explains how to configure and use the interactive AI-powered mascot system in the Kids Coding Platform.

## Overview

Bugsby is an AI-powered interactive mascot that provides contextual help, encouragement, and guidance throughout the learning platform. The mascot appears on every page and can respond to user questions with intelligent, age-appropriate answers.

## Features

- **Context-Aware Help**: Understands which page the user is on and provides relevant assistance
- **AI-Powered Responses**: Uses OpenAI GPT or Anthropic Claude for intelligent responses
- **Child-Safe**: Designed specifically for young learners with appropriate language and safety filters
- **Learning Integration**: Provides hints during quizzes and helps with difficult concepts
- **Always Available**: Floating mascot button present on every page
- **Encouraging Personality**: Maintains a positive, supportive tone

## Architecture

### Components

1. **InteractiveMascot.tsx** - Main mascot chat interface
2. **MascotWrapper.tsx** - Global wrapper that adds mascot to all pages
3. **mascotAIService.ts** - AI service integration layer
4. **mascotData.ts** - Mascot configuration and personality data

### AI Service Integration

The system supports multiple AI providers:

- **OpenAI GPT** (recommended for production)
- **Anthropic Claude** (alternative option)
- **Mock responses** (for development/testing)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Choose AI provider: 'openai', 'anthropic', or 'mock'
REACT_APP_AI_PROVIDER=mock

# OpenAI Configuration (if using OpenAI)
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_OPENAI_MODEL=gpt-3.5-turbo

# Anthropic Configuration (if using Anthropic)
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
REACT_APP_ANTHROPIC_MODEL=claude-3-haiku-20240307
```

### Switching AI Providers

To switch from mock responses to a real AI provider, update the service configuration:

```typescript
// In mascotAIService.ts
export const mascotAI = new MascotAIService({
  provider: 'openai', // or 'anthropic'
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  model: 'gpt-3.5-turbo'
});
```

## Usage Examples

### Basic Implementation

The mascot is automatically added to all child pages through the MascotWrapper in App.tsx:

```tsx
<MascotWrapper>
  <Routes>
    {/* All your routes */}
  </Routes>
</MascotWrapper>
```

### Quiz Integration

Quizzes can integrate with the mascot for contextual help:

```tsx
<QuizComponent
  title="HTML Basics"
  questions={questions}
  onComplete={handleComplete}
  onNeedHelp={(question, index) => {
    // This triggers mascot help for specific questions
    mascotAI.getResponse(
      `Help with: ${question.question}`,
      learningContext
    );
  }}
/>
```

### Custom Mascot Interactions

You can trigger custom mascot messages from any component:

```typescript
import { mascotAI, LearningContext } from '../services/mascotAIService';

const context: LearningContext = {
  userId: user.id,
  userName: user.displayName,
  currentPage: 'build',
  userLevel: user.progress.level,
  recentModules: user.progress.completedModules,
  currentModule: user.progress.currentModule
};

const response = await mascotAI.getResponse(
  "How do I create a game?",
  context
);
```

## API Reference

### MascotAIService

#### Methods

- `getResponse(message: string, context: LearningContext): Promise<AIResponse>`
- `updateConfig(config: Partial<AIServiceConfig>): void`
- `isConfigured(): boolean`

#### Interfaces

```typescript
interface LearningContext {
  userId: string;
  userName: string;
  currentPage: string;
  userLevel: number;
  recentModules: string[];
  currentModule?: string;
  strugglingTopics?: string[];
  preferredLearningStyle?: string;
}

interface AIResponse {
  text: string;
  confidence: number;
  processingTime: number;
}
```

### InteractiveMascot Props

```typescript
interface InteractiveMascotProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  context?: string; // Current page context
  autoGreeting?: boolean; // Show greeting on load
}
```

## Customization

### Adding New Contexts

To add support for new page contexts, update the context detection in MascotWrapper.tsx:

```typescript
const getPageContext = (pathname: string): string => {
  if (pathname.includes('/learn')) return 'learn';
  if (pathname.includes('/build')) return 'build';
  if (pathname.includes('/new-section')) return 'new-section'; // Add new context
  // ... other contexts
  return 'general';
};
```

Then add corresponding responses in the AI service.

### Modifying Mascot Personality

Edit the system prompt in `mascotAIService.ts`:

```typescript
private buildSystemPrompt(): string {
  return `You are Bugsby, a friendly coding companion...
    // Customize personality traits here
  `;
}
```

### Adding Quick Help Actions

Add new quick help buttons in InteractiveMascot.tsx:

```typescript
const getQuickHelp = () => {
  const quickHelpMessages = {
    // Add new quick help messages for different contexts
    'new-context': "Custom help message for new context!",
  };
  // ...
};
```

## Safety and Content Filtering

The AI service includes several safety measures:

1. **System Prompt Constraints**: AI is instructed to only discuss coding topics
2. **Content Filtering**: Responses are filtered for age-appropriateness
3. **Fallback Responses**: Safe, pre-written responses if AI fails
4. **Topic Restrictions**: AI redirects non-coding questions

## Development and Testing

### Mock Mode

For development, use mock mode to test without API costs:

```typescript
const mascotAI = new MascotAIService({
  provider: 'mock'
});
```

### Testing AI Responses

Use the TestQuizPage component to test mascot interactions:

```bash
# Navigate to /test-quiz to see the demo
```

## Performance Considerations

- **Response Caching**: Consider implementing response caching for common questions
- **Rate Limiting**: Implement rate limiting to prevent API abuse
- **Fallback Strategy**: Always have pre-written responses as fallbacks
- **Context Optimization**: Only send relevant context to reduce token usage

## Troubleshooting

### Common Issues

1. **No AI Response**: Check API key configuration and network connectivity
2. **Inappropriate Responses**: Review and adjust system prompt
3. **Slow Responses**: Consider using faster models or implementing caching
4. **Mascot Not Appearing**: Check user authentication and MascotWrapper implementation

### Debug Mode

Enable debug logging by updating the service configuration:

```typescript
// Add debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('AI Request:', message, context);
  console.log('AI Response:', response);
}
```

## Future Enhancements

- **Voice Interaction**: Add voice input/output capabilities
- **Animation System**: Enhanced mascot animations and expressions
- **Learning Analytics**: Track interaction patterns to improve responses
- **Multilingual Support**: Add support for multiple languages
- **Advanced Context**: Include code analysis for more targeted help
