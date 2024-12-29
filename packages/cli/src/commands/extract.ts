import fs from "node:fs";
import { confirm, intro, outro, text } from "@clack/prompts";
import chalk from "chalk";
import { glob } from "glob";
import { parseJS } from "../parsers/js.js";
import { getConfig, updateConfig } from "../utils.js";

export async function extract(update = false) {
  intro("Extracting translation keys...");

  const config = await getConfig();

  if (!config.extract?.length) {
    const shouldContinue = await confirm({
      message: "Would you like to add extract patterns to your config?",
    });

    if (!shouldContinue) {
      process.exit(1);
    }

    const pattern = await text({
      message: "Where would you like to extract translations from?",
      defaultValue: "./src/**/*.{ts,tsx}",
      placeholder: "./src/**/*.{ts,tsx}",
    });

    if (typeof pattern === "symbol") {
      process.exit(0);
    }

    // Add extract pattern and save config
    await updateConfig({
      ...config,
      extract: [pattern],
    });

    outro("Updated config with extract patterns");
    return [];
  }

  const foundKeys = new Set<string>();

  for (const pattern of config.extract) {
    const files = glob.sync(pattern);

    for (const file of files) {
      const code = fs.readFileSync(file, "utf8");
      const keys = parseJS(code);

      for (const key of keys) {
        foundKeys.add(key);
      }
    }
  }

  const keys = Array.from(foundKeys);

  if (config.files.json.include.length === 0) {
    outro(chalk.red("No translation files found in config"));
    return [];
  }

  // Get source locale file path from config
  const sourceLocale = config.locale.source;
  const sourceFile =
    typeof config.files.json.include[0] === "string"
      ? config.files.json.include[0].replace("[locale]", sourceLocale)
      : config.files.json.include[0].from.replace("[locale]", sourceLocale);

  // Read existing translations if any
  let translations: Record<string, string> = {};
  if (fs.existsSync(sourceFile)) {
    const content = fs.readFileSync(sourceFile, "utf8");
    const ext = sourceFile.split(".").pop()?.toLowerCase();

    if (ext === "json") {
      translations = JSON.parse(content);
    } else if (ext === "ts" || ext === "js") {
      // For TS/JS files, use jiti to safely load the module
      const jiti = require("jiti")(process.cwd());
      const mod = jiti(sourceFile);
      translations = mod.default || mod;
    } else if (ext === "md" || ext === "mdx") {
      // For MD/MDX files, parse frontmatter
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (match) {
        translations = JSON.parse(match[1]);
      }
    }
  }

  // Add new keys with empty translations
  const newKeys = keys.filter((key) => !translations[key]);

  if (update) {
    for (const key of keys) {
      if (!translations[key]) {
        translations[key] = "";
      }
    }

    // Write back to source file based on extension
    const ext = sourceFile.split(".").pop()?.toLowerCase();
    let output = "";

    if (ext === "json") {
      output = JSON.stringify(translations, null, 2);
    } else if (ext === "ts") {
      output = `export default ${JSON.stringify(translations, null, 2)}`;
    } else if (ext === "js") {
      output = `module.exports = ${JSON.stringify(translations, null, 2)}`;
    } else if (ext === "md" || ext === "mdx") {
      output = `---\n${JSON.stringify(translations, null, 2)}\n---\n`;
    }

    fs.writeFileSync(sourceFile, output);
  }
  if (newKeys.length > 0) {
    outro(
      chalk.green(
        `Found ${newKeys.length} new translation keys from source files${update ? ` and saved them to ${sourceFile}` : ""}`,
      ),
    );
  } else {
    outro(chalk.yellow("No new translation keys found"));
  }

  return keys;
}
