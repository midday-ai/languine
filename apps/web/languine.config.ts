import { defineConfig } from "languine";

export default defineConfig({
  version: "1.0.2",
  locale: {
    source: "en",
    targets: ["sv"],
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
