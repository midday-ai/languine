import { defineConfig } from "languine";

export default defineConfig({
  version: "0.5.6",
  locale: {
    source: "en",
    targets: ["fr"],
  },
  files: {
    ts: {
      include: ["locales/[locale].ts"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
});
