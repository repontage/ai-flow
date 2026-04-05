import { OpenAIClient } from './openai';

export class GroqClient extends OpenAIClient {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.groq.com/openai/v1');
  }

  async getAvailableModels(): Promise<string[]> {
    return ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
  }
}
