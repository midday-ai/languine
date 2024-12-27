import { defineConfig } from "languine";

export default defineConfig({
  version: "1.0.0",
  locale: {
    source: "en",
    targets: ["de"],
  },
  files: {
    json: {
      include: ["messages/[locale].json"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
});
