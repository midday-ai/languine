import { defineConfig } from "languine";

export default defineConfig({
  version: "7.0.0",
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    json: {
      include: ["locales/native/[locale].json", "locales/[locale].json"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
});
