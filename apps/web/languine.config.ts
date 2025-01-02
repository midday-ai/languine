import { defineConfig } from "languine";

export default defineConfig({
  version: "1.0.2",
  locale: {
    source: "en",
    targets: ["es", "fr", "de", "ja", "zh", "ar", "ko", "sv", "no", "fi", "pt"],
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
  extract: ["./src/**/*.{ts,tsx}"]
});