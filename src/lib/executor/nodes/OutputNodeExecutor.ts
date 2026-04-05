interface ExecuteParams {
  config: Record<string, unknown>;
  input: unknown;
}

export class OutputNodeExecutor {
  async execute({ config, input }: ExecuteParams) {
    const nodeType = config._nodeType as string;
    const text = typeof input === 'string' ? input : JSON.stringify(input, null, 2);

    switch (nodeType) {
      case 'clipboardOutput': {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // clipboard may not be available in all contexts
        }
        break;
      }

      case 'fileSave': {
        const filename = (config.filename as string) || 'output.txt';
        const mimeType = (config.mimeType as string) || 'text/plain';
        const blob = new Blob([text], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
      }

      case 'notificationOutput': {
        const title = (config.notifTitle as string) || 'AI Flow 알림';
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(title, { body: text.substring(0, 200) });
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              new Notification(title, { body: text.substring(0, 200) });
            }
          }
        }
        break;
      }

      case 'httpRequest': {
        const url = (config.url as string) || '';
        if (!url) throw new Error('URL을 입력하세요');
        const method = (config.method as string) || 'GET';
        const headers: Record<string, string> = {};
        if (config.contentType) headers['Content-Type'] = config.contentType as string;
        if (config.authHeader) headers['Authorization'] = config.authHeader as string;

        const fetchOptions: RequestInit = { method, headers };
        if (method !== 'GET' && method !== 'HEAD') {
          fetchOptions.body = typeof input === 'string' ? input : JSON.stringify(input);
          if (!config.contentType) headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, fetchOptions);
        const responseText = await response.text();
        try {
          return JSON.parse(responseText);
        } catch {
          return responseText;
        }
      }
    }

    return input;
  }
}
