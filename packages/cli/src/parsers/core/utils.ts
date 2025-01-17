import type { Parser } from "./types.js";

export class ParserError extends Error {
  code: string;
  details?: unknown;

  constructor(
    message: string,
    options: { code: string; details?: unknown } = { code: "UNKNOWN" },
  ) {
    super(message);
    this.name = "ParserError";
    this.code = options.code;
    this.details = options.details;
  }
}

export function createParser<T extends Parser>(parser: T): T {
  return parser;
}

export function composeParsers(parsers: Parser[]): Parser {
  return {
    async parse(input: string) {
      let result = input;
      let data = {};

      for (const parser of parsers) {
        const parsed = await parser.parse(result);
        data = { ...data, ...parsed };
        result = JSON.stringify(parsed);
      }

      return data;
    },

    async serialize(data: Record<string, string>) {
      let result = data;
      let output = JSON.stringify(data);

      for (const parser of parsers.slice().reverse()) {
        output = await parser.serialize(result);
        try {
          result = JSON.parse(output);
        } catch {
          // If the output is not JSON, just pass it through
          result = output as unknown as Record<string, string>;
        }
      }

      return output;
    },
  };
}
