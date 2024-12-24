import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { intro, outro, select, text } from "@clack/prompts";
import { providers } from "../model-providers.js";
import type { Provider } from "../types.js";
import { configPath } from "../utils.js";

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

  const filesDirectory = (await text({
    message: "Where should language files be stored?",
    placeholder: "src/locales",
    defaultValue: "src/locales",
    validate: () => undefined,
  })) as string;

  const fileFormat = (await select({
    message: "What format should language files use?",
    options: [
      { value: "ts", label: "TypeScript (.ts)" },
      { value: "json", label: "JSON (.json)" },
    ],
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
    targets: ${JSON.stringify(targetLanguages.split(",").map((l) => l.trim()))}
  },
  files: {
    ${fileFormat}: {
      include: ["${filesDirectory}/[locale].${fileFormat}"]
    }
  },
  llm: {
    provider: "${provider}",
    model: "${model}"
  }
}`;

  try {
    await fs.mkdir(path.join(process.cwd(), filesDirectory), {
      recursive: true,
    });

    const sourceFile = path.join(
      process.cwd(),
      `${filesDirectory}/${sourceLanguage}.${fileFormat}`,
    );
    if (
      !(await fs
        .access(sourceFile)
        .then(() => true)
        .catch(() => false))
    ) {
      await fs.writeFile(sourceFile, "", "utf-8");
    }

    const targetLangs = targetLanguages.split(",");
    for (const targetLang of targetLangs.map((l: string) => l.trim())) {
      const targetFile = path.join(
        process.cwd(),
        `${filesDirectory}/${targetLang}.${fileFormat}`,
      );
      if (
        !(await fs
          .access(targetFile)
          .then(() => true)
          .catch(() => false))
      ) {
        await fs.writeFile(targetFile, "", "utf-8");
      }
    }

    // Write config file
    await fs.writeFile(configPath, configContent);
    outro("Configuration file and language files created successfully!");
  } catch (error) {
    outro("Failed to create config and language files");
    process.exit(1);
  }
}
