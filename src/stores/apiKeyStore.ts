import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIProvider } from '../types/nodes';
import { createProvider } from '../lib/providers';

interface ApiKeyEntry {
  provider: AIProvider;
  key: string;
  label?: string;
  baseUrl?: string;
  addedAt: string;
  isValid?: boolean;
}

interface ApiKeyStore {
  keys: Partial<Record<AIProvider, ApiKeyEntry>>;
  setKey: (provider: AIProvider, key: string, options?: Partial<ApiKeyEntry>) => void;
  removeKey: (provider: AIProvider) => void;
  getKey: (provider: AIProvider) => string | undefined;
  hasKey: (provider: AIProvider) => boolean;
  validateKey: (provider: AIProvider) => Promise<boolean>;
  getAllKeys: () => Record<string, string>;
}

export const useApiKeyStore = create<ApiKeyStore>()(
  persist(
    (set, get) => ({
      keys: {},
      setKey: (provider, key, options) =>
        set(state => ({
          keys: {
            ...state.keys,
            [provider]: { provider, key, addedAt: new Date().toISOString(), ...options },
          },
        })),
      removeKey: (provider) =>
        set(state => {
          const newKeys = { ...state.keys };
          delete newKeys[provider];
          return { keys: newKeys };
        }),
      getKey: (provider) => get().keys[provider]?.key,
      hasKey: (provider) => !!get().keys[provider]?.key,
      validateKey: async (provider) => {
        const entry = get().keys[provider];
        if (!entry?.key && provider !== 'ollama') return false;
        try {
          const client = createProvider(provider, entry?.key || '', { baseUrl: entry?.baseUrl });
          const isValid = await client.validate();
          set(state => ({
            keys: {
              ...state.keys,
              [provider]: state.keys[provider] ? { ...state.keys[provider]!, isValid } : state.keys[provider],
            },
          }));
          return isValid;
        } catch {
          return false;
        }
      },
      getAllKeys: () => {
        const keys: Record<string, string> = {};
        for (const [provider, entry] of Object.entries(get().keys)) {
          if (entry?.key) keys[provider] = entry.key;
        }
        return keys;
      },
    }),
    { name: 'ai-flow-api-keys' }
  )
);
