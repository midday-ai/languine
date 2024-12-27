import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { intro, outro, select, text } from "@clack/prompts";
import chalk from "chalk";
import { providers } from "../providers.js";
import type { PresetOptions, Provider } from "../types.js";
import { configPath } from "../utils.js";

async function createDirectoryOrFile(filePath: string, isDirectory = false) {
  try {
    const dirPath = isDirectory ? filePath : path.dirname(filePath);
    await fs.mkdir(dirPath, { recursive: true });

    if (!isDirectory) {
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        await fs.writeFile(filePath, "", "utf-8");
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to create ${isDirectory ? "directory" : "file"}: ${filePath}`,
    );
  }
}

async function getPresetConfig(preset: string, options: PresetOptions) {
  switch (preset) {
    case "expo": {
      const { expo } = await import("../presets/expo.js");
      return expo(options);
    }
    default:
      return null;
  }
}

function getDefaultPattern(format: string) {
  switch (format) {
    case "ts":
      return "locales/[locale].ts";
    case "xcode-strings":
      return "Example/[locale].lproj/Localizable.strings";
    case "xcode-stringsdict":
      return "Example/[locale].lproj/Localizable.stringsdict";
    case "xcode-xcstrings":
      return "Example/Localizable.xcstrings";
    case "yaml":
      return "locales/[locale].yml";
    case "json":
      return "locales/[locale].json";
    case "md":
      return "docs/[locale]/*.md";
    case "po":
      return "locales/[locale].po";
    case "xml":
      return "locales/[locale].xml";
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

export async function init(preset?: string) {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
  } catch (error) {
    outro(
      "Languine requires Git to track changes in translation keys and files. Please initialize a Git repository first.",
    );
    process.exit(1);
  }

  intro("Let's set up your i18n configuration");

  const sourceLanguage = (await select({
    message: "What is your source language?",
    options: [
      { value: "en", label: "English", hint: "recommended" },
      { value: "es", label: "Spanish" },
      { value: "fr", label: "French" },
      { value: "de", label: "German" },
    ],
  })) as string;

  const targetLanguages = (await text({
    message: "What languages do you want to translate to?",
    placeholder: "es, fr, de, zh, ja, pt",
    validate: (value) => {
      if (!value) return "Please enter at least one language";
      return;
    },
  })) as string;

  let fileFormat: string;
  let filesPatterns: string[];

  if (!preset) {
    fileFormat = (await select({
      message: "What format should language files use?",
      options: [
        { value: "ts", label: "TypeScript (.ts)" },
        { value: "json", label: "JSON (.json)" },
        { value: "md", label: "Markdown (.md)" },
        { value: "xcode-strings", label: "Xcode Strings (.strings)" },
        {
          value: "xcode-stringsdict",
          label: "Xcode Stringsdict (.stringsdict)",
        },
        { value: "xcode-xcstrings", label: "Xcode XCStrings (.xcstrings)" },
        { value: "yaml", label: "YAML (.yml)" },
        { value: "po", label: "Gettext (.po)" },
        { value: "android", label: "Android (.xml)" },
      ],
    })) as string;

    const defaultPattern = getDefaultPattern(fileFormat);
    const patternsInput = (await text({
      message:
        "Where should language files be stored? (separate multiple patterns with comma)",
      placeholder: defaultPattern,
      defaultValue: defaultPattern,
      validate: () => undefined,
    })) as string;
    filesPatterns = patternsInput.split(",").map((p) => p.trim());
  } else {
    const presetConfig = await getPresetConfig(preset, {
      sourceLanguage,
      targetLanguages: targetLanguages.split(",").map((l) => l.trim()),
    });

    if (!presetConfig) {
      throw new Error(`Invalid preset: ${preset}`);
    }

    fileFormat = presetConfig.fileFormat;
    filesPatterns = Array.isArray(presetConfig.filesPattern)
      ? presetConfig.filesPattern
      : [presetConfig.filesPattern];
  }

  const provider = (await select<Provider>({
    message: "Which provider would you like to use?",
    options: Object.values(providers),
    initialValue: "openai",
  })) as Provider;

  if (provider === "ollama") {
    try {
      const ollamaBinary = execSync("which ollama").toString().trim();
      if (!ollamaBinary) {
        outro("Ollama binary not found. Please install Ollama");
        process.exit(1);
      }
    } catch (error) {
      outro("Ollama binary not found. Please install Ollama");
      process.exit(1);
    }
  }

  const models = await providers[provider].getModels();

  const model = (await select({
    message: "Which model should be used for translations?",
    options: models,
  })) as string;
  const configContent = `import { defineConfig } from "languine";

export default defineConfig({
  version: "${require("../../package.json").version}",
  locale: {
    source: "${sourceLanguage}",
    targets: ${JSON.stringify(targetLanguages.split(",").map((l) => l.trim()))},
  },
  files: {
    ${fileFormat.includes("-") ? `"${fileFormat}"` : fileFormat}: {
      include: ${JSON.stringify(filesPatterns)},
    },
  },
  llm: {
    provider: "${provider}",
    model: "${model}",
  },
})`;

  try {
    const targetLangs = [
      sourceLanguage,
      ...targetLanguages.split(",").map((l) => l.trim()),
    ];

    for (const pattern of filesPatterns) {
      const isDirectory = pattern.includes("*");

      for (const lang of targetLangs) {
        const filePath = path.join(
          process.cwd(),
          pattern.replace("[locale]", lang),
        );

        if (isDirectory) {
          // For patterns with wildcards, create the directory structure
          await createDirectoryOrFile(path.dirname(filePath), true);
        } else {
          // For direct file patterns, create the file
          await createDirectoryOrFile(filePath);
        }
      }
    }

    // Write config file
    await fs.writeFile(configPath, configContent);
    outro(
      "Configuration file and language files/directories created successfully!",
    );
  } catch (error) {
    outro(
      `Problems? ${chalk.underline(chalk.cyan("https://go.midday.ai/wzhr9Gt"))}`,
    );
    process.exit(1);
  }
}
