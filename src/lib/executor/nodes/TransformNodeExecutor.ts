import { renderTemplate } from '../../templateEngine';

interface ExecuteParams {
  config: Record<string, unknown>;
  input: unknown;
  context: Record<string, unknown>;
}

export class TransformNodeExecutor {
  async execute({ config, input, context }: ExecuteParams) {
    const nodeType = config._nodeType as string;
    const fullContext = { ...context, input };

    switch (nodeType) {
      case 'textTemplate': {
        const template = (config.template as string) || '{{input}}';
        return renderTemplate(template, fullContext as Parameters<typeof renderTemplate>[1]);
      }

      case 'jsonParser': {
        try {
          const text = typeof input === 'string' ? input : JSON.stringify(input);
          const parsed = JSON.parse(text);
          const path = config.path as string;
          if (path) {
            return path.split('.').reduce((obj: unknown, key) => (obj as Record<string, unknown>)?.[key], parsed);
          }
          return parsed;
        } catch {
          throw new Error('JSON 파싱 실패');
        }
      }

      case 'codeNode': {
        const code = (config.code as string) || 'return input;';
        try {
          const fn = new Function('input', 'context', code);
          return fn(input, context);
        } catch (e) {
          throw new Error(`코드 실행 오류: ${(e as Error).message}`);
        }
      }

      case 'textSplit': {
        const text = typeof input === 'string' ? input : String(input);
        const delimiter = (config.delimiter as string) ?? '\n';
        const actualDelimiter = delimiter === '\\n' ? '\n' : delimiter === '\\t' ? '\t' : delimiter;
        const parts = text.split(actualDelimiter).map(s => s.trim()).filter(s => (config.removeEmpty ? s.length > 0 : true));
        return parts;
      }

      case 'textMerge': {
        const separator = (config.separator as string) ?? '\n';
        const actualSep = separator === '\\n' ? '\n' : separator === '\\t' ? '\t' : separator;
        if (Array.isArray(input)) {
          return input.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join(actualSep);
        }
        return String(input);
      }

      case 'textReplace': {
        const text = typeof input === 'string' ? input : String(input);
        const find = (config.find as string) || '';
        const replace = (config.replace as string) || '';
        const useRegex = config.useRegex as boolean;
        if (!find) return text;
        if (useRegex) {
          try {
            const flags = (config.regexFlags as string) || 'g';
            return text.replace(new RegExp(find, flags), replace);
          } catch {
            throw new Error('정규식 오류');
          }
        }
        return text.split(find).join(replace);
      }

      case 'textCase': {
        const text = typeof input === 'string' ? input : String(input);
        const caseType = (config.caseType as string) || 'upper';
        switch (caseType) {
          case 'upper': return text.toUpperCase();
          case 'lower': return text.toLowerCase();
          case 'title': return text.replace(/\b\w/g, c => c.toUpperCase());
          case 'camel': return text
            .toLowerCase()
            .replace(/[^a-zA-Z0-9가-힣]+(.)/g, (_, c) => c.toUpperCase());
          case 'snake': return text
            .toLowerCase()
            .replace(/\s+/g, '_');
          case 'trim': return text.trim();
          default: return text;
        }
      }

      case 'numberCalc': {
        const a = parseFloat(String(input));
        const b = parseFloat(String(config.operand ?? 0));
        const op = (config.operation as string) || 'add';
        if (isNaN(a)) throw new Error('입력값이 숫자가 아닙니다');
        switch (op) {
          case 'add': return a + b;
          case 'subtract': return a - b;
          case 'multiply': return a * b;
          case 'divide':
            if (b === 0) throw new Error('0으로 나눌 수 없습니다');
            return a / b;
          case 'modulo': return a % b;
          case 'power': return Math.pow(a, b);
          case 'round': return Math.round(a);
          case 'floor': return Math.floor(a);
          case 'ceil': return Math.ceil(a);
          case 'abs': return Math.abs(a);
          default: return a;
        }
      }

      case 'csvParser': {
        const text = typeof input === 'string' ? input : String(input);
        const delimiter = (config.csvDelimiter as string) || ',';
        const lines = text.trim().split('\n');
        if (lines.length === 0) return [];
        const hasHeader = config.hasHeader !== false;
        if (!hasHeader) {
          return lines.map(line => line.split(delimiter).map(c => c.trim()));
        }
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        return lines.slice(1).map(line => {
          const values = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
          return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
        });
      }

      case 'delayNode': {
        const ms = (config.delayMs as number) || 1000;
        await new Promise(resolve => setTimeout(resolve, ms));
        return input;
      }

      default:
        return input;
    }
  }
}
