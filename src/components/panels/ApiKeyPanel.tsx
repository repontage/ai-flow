import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Loader, Trash2 } from 'lucide-react';
import { AIProvider } from '../../types/nodes';
import { PROVIDER_LABELS } from '../../lib/providers';
import { useApiKeyStore } from '../../stores/apiKeyStore';

const providers: AIProvider[] = ['openai', 'anthropic', 'google-gemini', 'groq', 'ollama', 'custom'];

export function ApiKeyPanel() {
  const { keys, setKey, removeKey, validateKey } = useApiKeyStore();
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const [validationResult, setValidationResult] = useState<Record<string, boolean | null>>({});

  const handleSave = (provider: AIProvider) => {
    const key = inputValues[provider];
    if (key) {
      setKey(provider, key);
      setInputValues(s => ({ ...s, [provider]: '' }));
    }
  };

  const handleValidate = async (provider: AIProvider) => {
    setValidating(s => ({ ...s, [provider]: true }));
    const result = await validateKey(provider);
    setValidating(s => ({ ...s, [provider]: false }));
    setValidationResult(s => ({ ...s, [provider]: result }));
  };

  return (
    <div className="space-y-4">
      {providers.map(provider => {
        const entry = keys[provider];
        const isOllama = provider === 'ollama';
        const isValidating = validating[provider];
        const result = validationResult[provider];

        return (
          <div key={provider} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{PROVIDER_LABELS[provider]}</span>
                {entry?.key && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">설정됨</span>
                )}
              </div>
              {entry?.key && (
                <button onClick={() => removeKey(provider)} className="text-slate-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {entry?.key ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-900 rounded-lg px-3 py-2 text-slate-400 text-sm font-mono">
                  {'•'.repeat(20)}
                </div>
                <button
                  onClick={() => handleValidate(provider)}
                  disabled={isValidating}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isValidating ? <Loader size={12} className="animate-spin" /> : '테스트'}
                </button>
                {result === true && <CheckCircle size={16} className="text-green-400" />}
                {result === false && <XCircle size={16} className="text-red-400" />}
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey[provider] ? 'text' : 'password'}
                    value={inputValues[provider] || ''}
                    onChange={e => setInputValues(s => ({ ...s, [provider]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleSave(provider)}
                    placeholder={isOllama ? 'http://localhost:11434' : 'API 키 입력...'}
                    className="w-full bg-slate-900 text-white text-sm px-3 py-2 pr-9 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  {!isOllama && (
                    <button
                      onClick={() => setShowKey(s => ({ ...s, [provider]: !s[provider] }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showKey[provider] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleSave(provider)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg"
                >
                  저장
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
