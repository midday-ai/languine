/**
 * Configuration interface for Languine
 */
export interface Config {
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
