import { openai } from "@ai-sdk/openai";

export function getModel() {
  return openai("gpt-4-turbo-preview");
}
