import { AINodeConfig } from '../../../types/nodes';
import { createProvider } from '../../providers';
import { renderTemplate } from '../../templateEngine';

interface ExecuteParams {
  config: Record<string, unknown>;
  input: unknown;
  context: Record<string, unknown>;
  apiKeys: Record<string, string>;
  signal?: AbortSignal;
}

export class AINodeExecutor {
  async execute({ config, input, context, apiKeys }: ExecuteParams) {
    const nodeType = config._nodeType as string;

    // Image Analysis node (vision)
    if (nodeType === 'imageAnalysis') {
      return this.executeImageAnalysis({ config, input, context, apiKeys });
    }

    const { provider, model, systemPrompt, userPromptTemplate, temperature, maxTokens } = config as unknown as AINodeConfig;

    const apiKey = apiKeys[provider] || '';
    if (!apiKey && provider !== 'ollama') {
      throw new Error(`${provider} API 키가 설정되지 않았습니다`);
    }

    const client = createProvider(provider, apiKey, { baseUrl: (config.baseUrl as string) });
    const fullContext = { ...context, input };
    const userPrompt = renderTemplate(userPromptTemplate || '{{input}}', fullContext as Parameters<typeof renderTemplate>[1]);

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: renderTemplate(systemPrompt, fullContext as Parameters<typeof renderTemplate>[1]) });
    }
    messages.push({ role: 'user', content: userPrompt });

    const response = await client.complete({ messages, model, temperature, maxTokens });

    return {
      text: response.content,
      usage: response.usage,
      model: response.model,
    };
  }

  private async executeImageAnalysis({ config, input, apiKeys }: ExecuteParams) {
    const provider = (config.provider as string) || 'openai';
    const model = (config.model as string) || 'gpt-4o';
    const apiKey = apiKeys[provider] || '';
    if (!apiKey) throw new Error(`${provider} API 키가 설정되지 않았습니다`);

    const imageUrl = (config.imageUrl as string) || (typeof input === 'string' ? input : '');
    const question = (config.question as string) || '이 이미지를 설명해주세요.';

    if (!imageUrl) throw new Error('이미지 URL을 입력하세요');

    // OpenAI vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: question },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: (config.maxTokens as number) || 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message || `API 오류: ${response.status}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }>; model: string };
    return {
      text: data.choices[0].message.content,
      model: data.model,
      imageUrl,
    };
  }
}
