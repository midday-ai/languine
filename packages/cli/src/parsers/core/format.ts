import type { Parser } from "./types.js";

export interface FormatParserOptions {
  filePath?: string;
  defaultLocale?: string;
  formatOptions?: Record<string, unknown>;
}

export type FormatParserFactory<T extends Parser> = (
  options?: FormatParserOptions,
) => T;

export function createFormatParser<T extends Parser>(
  parser: T,
  options: FormatParserOptions = {},
): T {
  const { defaultLocale } = options;

  return {
    ...parser,
    defaultLocale,
    setDefaultLocale(locale: string) {
      this.defaultLocale = locale;
    },
  };
}
