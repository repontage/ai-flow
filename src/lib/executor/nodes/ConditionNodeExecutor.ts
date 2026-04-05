import { ConditionNodeConfig } from '../../../types/nodes';
import { renderTemplate } from '../../templateEngine';

interface ExecuteParams {
  config: Record<string, unknown>;
  input: unknown;
  context: Record<string, unknown>;
}

export class ConditionNodeExecutor {
  async execute({ config, input, context }: ExecuteParams) {
    const nodeType = config._nodeType as string;
    const fullContext = { ...context, input };

    if (nodeType === 'switchNode') {
      const switchField = renderTemplate((config.switchField as string) || '{{input}}', fullContext as Parameters<typeof renderTemplate>[1]);
      const cases = (config.cases as Array<{ value: string; port: string }>) || [];
      for (const c of cases) {
        if (switchField === c.value) {
          return { _activePort: c.port, value: input };
        }
      }
      return { _activePort: (config.defaultPort as string) || 'default', value: input };
    }

    if (nodeType === 'loopNode') {
      // loopNode outputs the array as-is; actual iteration is handled by the executor
      const arr = Array.isArray(input) ? input : [input];
      return { _isLoop: true, items: arr, value: input };
    }

    // ifElse
    const { conditions, defaultPort } = config as unknown as ConditionNodeConfig;

    for (const condition of conditions || []) {
      const fieldValue = renderTemplate(condition.field, fullContext as Parameters<typeof renderTemplate>[1]);
      const condValue = condition.value;

      let matches = false;
      switch (condition.operator) {
        case 'equals': matches = fieldValue === condValue; break;
        case 'contains': matches = fieldValue.includes(condValue); break;
        case 'greater': matches = parseFloat(fieldValue) > parseFloat(condValue); break;
        case 'less': matches = parseFloat(fieldValue) < parseFloat(condValue); break;
        case 'regex': matches = new RegExp(condValue).test(fieldValue); break;
      }

      if (matches) {
        return { _activePort: condition.outputPort, value: input };
      }
    }

    return { _activePort: defaultPort || 'default', value: input };
  }
}
