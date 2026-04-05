import { AIProvider } from '../../types/nodes';
import { AIProviderClient } from '../../types/providers';
import { OpenAIClient } from './openai';
import { AnthropicClient } from './anthropic';
import { GeminiClient } from './gemini';
import { GroqClient } from './groq';
import { OllamaClient } from './ollama';

export function createProvider(
  provider: AIProvider,
  apiKey: string,
  options?: { baseUrl?: string }
): AIProviderClient {
  switch (provider) {
    case 'openai': return new OpenAIClient(apiKey, options?.baseUrl);
    case 'anthropic': return new AnthropicClient(apiKey);
    case 'google-gemini': return new GeminiClient(apiKey);
    case 'groq': return new GroqClient(apiKey);
    case 'ollama': return new OllamaClient(options?.baseUrl);
    case 'custom': return new OpenAIClient(apiKey, options?.baseUrl);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  'google-gemini': 'Google Gemini',
  'groq': 'Groq',
  'ollama': 'Ollama (Local)',
  'custom': 'Custom',
};

export const DEFAULT_MODELS: Record<AIProvider, string[]> = {
  'openai': ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  'anthropic': ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
  'google-gemini': ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  'groq': ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  'ollama': [],
  'custom': [],
};
