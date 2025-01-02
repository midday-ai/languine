import { defineConfig } from "languine";

export default defineConfig({
  version: "1.0.2",
  locale: {
    source: "en",
    targets: ["es", "fr", "de", "no", "sv", "fi"],
  },
  files: {
    ts: {
      include: ["src/locales/[locale].ts"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
  
});