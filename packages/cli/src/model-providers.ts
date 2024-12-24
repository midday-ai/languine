import ollama from "ollama";
import type { Provider } from "./types.js";

type ModelInfo = {
  value: string;
  label: string;
};

type ProviderConfig = {
  value: Provider;
  label: string;
  getModels: () => Promise<ModelInfo[]>;
};

export const providers: Record<Provider, ProviderConfig> = {
  openai: {
    value: "openai",
    label: "OpenAI",
    getModels: async () => [
      { value: "gpt-4-turbo", label: "GPT-4 Turbo (Default)" },
      { value: "gpt-4", label: "GPT-4" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4o-mini", label: "GPT-4o mini" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    ],
  },
  ollama: {
    value: "ollama",
    label: "Ollama",
    getModels: async () => {
      const { models } = await ollama.list();
      return models.map((model) => ({
        value: model.name,
        label: model.name,
      }));
    },
  },
};
