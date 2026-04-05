interface ExecuteParams {
  config: Record<string, unknown>;
  triggerData?: unknown;
}

export class TriggerNodeExecutor {
  async execute({ config, triggerData }: ExecuteParams) {
    if (triggerData !== undefined) return triggerData;

    const nodeType = config._nodeType as string;

    if (nodeType === 'webhookTrigger') {
      // In browser mode, webhookTrigger returns the sample payload for testing
      return config.samplePayload
        ? JSON.parse(config.samplePayload as string)
        : { message: 'webhook triggered', timestamp: Date.now() };
    }

    return config.defaultValue || '';
  }
}
