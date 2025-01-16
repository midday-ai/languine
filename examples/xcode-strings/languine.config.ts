import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    "xcode-strings": {
      include: ["Example/[locale].lproj/Localizable.strings"],
    },
  },
});
