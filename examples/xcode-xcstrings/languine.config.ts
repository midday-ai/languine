import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["de", "fr"],
  },
  files: {
    "xcode-xcstrings": {
      include: ["Example/Localizable.xcstrings"],
    },
  },
});
