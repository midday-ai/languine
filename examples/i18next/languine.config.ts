import { defineConfig } from "languine";

export default defineConfig({
  version: "0.6.6",
  locale: {
    source: "en",
    targets: ["sv"],
  },
  files: {
    json: {
      include: ["locales"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
});
