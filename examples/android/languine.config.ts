import { defineConfig } from "languine";

export default defineConfig({
  version: "0.6.7",
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    android: {
      include: ["locales/[locale].xml"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
});
