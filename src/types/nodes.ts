export type AIProvider = 'openai' | 'anthropic' | 'google-gemini' | 'groq' | 'ollama' | 'custom';

export type NodeCategory = 'trigger' | 'ai' | 'transform' | 'condition' | 'output';

export type NodeType =
  // Trigger
  | 'manualTrigger' | 'textInput' | 'webhookTrigger'
  // AI
  | 'aiChat' | 'aiStructuredOutput' | 'imageAnalysis'
  // Transform
  | 'textTemplate' | 'jsonParser' | 'codeNode'
  | 'textSplit' | 'textMerge' | 'textReplace' | 'textCase'
  | 'numberCalc' | 'csvParser' | 'delayNode'
  // Condition
  | 'ifElse' | 'switchNode' | 'loopNode'
  // Output
  | 'displayOutput' | 'clipboardOutput' | 'httpRequest'
  | 'fileSave' | 'notificationOutput';

export interface NodePort {
  id: string;
  label: string;
  type: 'string' | 'number' | 'object' | 'array' | 'any';
  required?: boolean;
}

export interface BaseNodeData {
  id: string;
  type: NodeType;
  category: NodeCategory;
  label: string;
  description?: string;
  inputs: NodePort[];
  outputs: NodePort[];
  config: Record<string, unknown>;
  status?: 'idle' | 'running' | 'success' | 'error';
  lastOutput?: unknown;
  error?: string;
  [key: string]: unknown;
}

export interface AINodeConfig {
  provider: AIProvider;
  model: string;
  systemPrompt?: string;
  userPromptTemplate: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export interface ConditionNodeConfig {
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'regex';
    value: string;
    outputPort: string;
  }>;
  defaultPort?: string;
}
