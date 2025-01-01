import type { LanguageModelV1 } from "ai";

export type Provider = "openai" | "ollama";

/**
 * Configuration interface for Languine
 */
export interface Config {
  /** Version of the Languine configuration */
  version: string;
  /** Locale configuration */
  locale: {
    /** Source language code (e.g. 'en') */
    source: string;
    /** Target language codes to translate to */
    targets: string[];
  };
  /** File configuration by format type */
  files: {
    /** Configuration for each file format */
    [format: string]: {
      /** Glob patterns or path mappings to include */
      include: Include[];

      /**
       * Filter by file path, keep the file if `true` is returned
       */
      filter?: (file: string) => boolean;
    };
  };
  /** Glob patterns to extract translation keys from source files  */
  extract?: string[];
  /** Language model configuration */
  llm: {
    /** LLM provider ('openai' or 'ollama') */
    provider: Provider;
    /** Model name to use */
    model: string;
    /** Temperature for model responses (0-1) */
    temperature?: number;
  };
  /** Custom translation instructions */
  instructions?: string;
  /** Hook functions */
  hooks?: {
    /** Hook called after translation is complete */
    afterTranslate?: (args: {
      /** Translated content */
      content: string;
      /** Path to the translated file */
      filePath: string;
    }) => Promise<string>;
  };
}

export type Include =
  | string
  | {
      from: string;
      to: string | ((locale: string) => string);
    }
  | {
      glob: string;
      to: (file: string, locale: string) => string;
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
