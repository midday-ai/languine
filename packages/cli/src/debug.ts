import { log } from "@clack/prompts";

export function debug(message: string) {
  if (process.env.DEBUG) {
    log.message(JSON.stringify(message, null, 2));
  }
}
