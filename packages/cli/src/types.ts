/**
 * Configuration interface for Languine
 */
export interface Config {
  /** Project ID from Languine (can be set via LANGUINE_PROJECT_ID env var) */
  projectId?: string;
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
      /** Glob patterns to include */
      include: (string | { glob: string })[];
    };
  };
  /** Hooks */
  hooks?: {
    /** Hook to run after translation */
    afterTranslate?: (args: {
      content: string;
      filePath: string;
    }) => Promise<string>;
  };
}

export interface ParserOptions {
  indent?: number;
  separator?: string;
  createDirectories?: boolean;
  encoding?: BufferEncoding;
}

export interface Parser {
  parse(input: string, locale: string): Promise<Record<string, string>>;
  serialize(
    data: Record<string, string>,
    locale: string,
    options: ParserOptions | null,
  ): Promise<string>;
}
