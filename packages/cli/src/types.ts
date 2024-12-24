import type { LanguageModelV1 } from "ai";

export interface Config {
  version: string;
  locale: {
    source: string;
    targets: string[];
  };
  files: {
    [key: string]: {
      include: string[];
    };
  };
  openai: {
    model: string;
  };
  instructions?: string;
  hooks?: {
    afterTranslate?: (args: {
      content: string;
      filePath: string;
    }) => Promise<string>;
  };
}

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
  diff: string;
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
