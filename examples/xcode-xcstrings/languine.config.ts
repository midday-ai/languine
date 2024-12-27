import { defineConfig } from "languine";

export default defineConfig({
  version: "0.6.2",
  locale: {
    source: "en",
    targets: ["de", "fr"],
  },
  files: {
    "xcode-xcstrings": {
      include: ["Example/Localizable.xcstrings"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
});
