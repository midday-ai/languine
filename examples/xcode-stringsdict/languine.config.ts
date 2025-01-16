import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    "xcode-stringsdict": {
      include: ["Example/[locale].lproj/Localizable.stringsdict"],
    },
  },
});
