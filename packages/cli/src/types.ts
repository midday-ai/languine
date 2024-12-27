import type { LanguageModelV1 } from "ai";

export type Provider = "openai" | "ollama";

export interface Config {
  version: string;
  locale: {
    source: string;
    targets: string[];
  };
  files: {
    [format: string]: {
      include: Include[];
    };
  };
  llm: {
    provider: Provider;
    model: string;
    temperature?: number;
  };
  instructions?: string;
  hooks?: {
    afterTranslate?: (args: {
      content: string;
      filePath: string;
    }) => Promise<string>;
  };
}

export type Include =
  | string
  | {
      from: string;
      to: string | ((locale: string) => string);
    };

export interface PromptOptions {
  format: string;
  content: string;
  contentLocale: string;

  targetLocale: string;

  config: Config;
  model: LanguageModelV1;
}

export interface PromptResult {
  content: string;
}

export interface UpdateOptions extends PromptOptions {
  /**
   * Content to update (translated content)
   */
  previousTranslation: string;

  /**
   * source content before updated
   */
  previousContent: string;
}

export interface UpdateResult {
  /**
   * Text summary of updated changes
   */
  summary?: string;

  content: string;
}

export type Awaitable<T> = T | Promise<T>;

export interface Translator {
  onNew: (options: PromptOptions) => Awaitable<PromptResult>;
  onUpdate: (options: UpdateOptions) => Awaitable<UpdateResult>;
}

export interface PresetOptions {
  sourceLanguage: string;
  targetLanguages: string[];
}
