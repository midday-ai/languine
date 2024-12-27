import { defineConfig } from "languine";

export default defineConfig({
  version: "0.6.2",
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    "xcode-strings": {
      include: ["Example/[locale].lproj/Localizable.strings"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
});
