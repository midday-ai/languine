import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { intro, outro, select, text } from "@clack/prompts";
import { providers } from "../providers.js";
import type { Provider } from "../types.js";
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

function getDefaultPattern(format: string) {
  switch (format) {
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

export async function init() {
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
      { value: "en", label: "English" },
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

  const fileFormat = (await select({
    message: "What format should language files use?",
    options: [
      { value: "ts", label: "TypeScript (.ts)" },
      { value: "json", label: "JSON (.json)" },
      { value: "md", label: "Markdown (.md)" },
      { value: "xcode-strings", label: "Xcode Strings (.strings)" },
      { value: "xcode-stringsdict", label: "Xcode Stringsdict (.stringsdict)" },
      { value: "xcode-xcstrings", label: "Xcode XCStrings (.xcstrings)" },
      { value: "yaml", label: "YAML (.yml)" },
      { value: "po", label: "Gettext (.po)" },
      { value: "android", label: "Android (.xml)" },
    ],
  })) as string;

  const defaultPattern = getDefaultPattern(fileFormat);
  const filesPattern = (await text({
    message: "Where should language files be stored?",
    placeholder: defaultPattern,
    defaultValue: defaultPattern,
    validate: () => undefined,
  })) as string;

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

  const configContent = `export default {
  version: "${require("../../package.json").version}",
  locale: {
    source: "${sourceLanguage}",
    targets: ${JSON.stringify(targetLanguages.split(",").map((l) => l.trim()))},
  },
  files: {
    ${fileFormat.includes("-") ? `"${fileFormat}"` : fileFormat}: {
      include: ["${filesPattern}"],
    },
  },
  llm: {
    provider: "${provider}",
    model: "${model}",
  },
}`;

  try {
    const targetLangs = [
      sourceLanguage,
      ...targetLanguages.split(",").map((l) => l.trim()),
    ];
    const isDirectory = filesPattern.includes("*");

    for (const lang of targetLangs) {
      const filePath = path.join(
        process.cwd(),
        filesPattern.replace("[locale]", lang),
      );

      if (isDirectory) {
        // For patterns with wildcards, create the directory structure
        await createDirectoryOrFile(path.dirname(filePath), true);
      } else {
        // For direct file patterns, create the file
        await createDirectoryOrFile(filePath);
      }
    }

    // Write config file
    await fs.writeFile(configPath, configContent);
    outro(
      "Configuration file and language files/directories created successfully!",
    );
  } catch (error) {
    outro("Failed to create config and language files");
    process.exit(1);
  }
}
