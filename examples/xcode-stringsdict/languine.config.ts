import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es", "de"],
  },
  files: {
    "xcode-stringsdict": {
      include: ["Example/[locale].lproj/Localizable.stringsdict"],
    },
  },
});
