import type { Parser } from "./types.js";

export function createFormatParser<T extends Parser>(parser: T): T {
  return parser;
}
