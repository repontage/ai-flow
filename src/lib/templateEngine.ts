interface TemplateContext {
  nodes?: Record<string, { output: unknown }>;
  workflow?: { variables?: Record<string, string> };
  triggerData?: unknown;
  input?: unknown;
}

function getValueByPath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function renderTemplate(template: string, context: TemplateContext): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmed = path.trim();

    if (trimmed === 'now') return new Date().toISOString();
    if (trimmed === 'timestamp') return String(Date.now());

    const value = getValueByPath(context, trimmed);
    if (value === undefined) return match;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });
}
