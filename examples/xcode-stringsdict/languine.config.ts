import { defineConfig } from "languine";

export default defineConfig({
  version: "0.6.2",
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    "xcode-stringsdict": {
      include: ["Example/[locale].lproj/Localizable.stringsdict"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
});
