import { existsSync } from "node:fs";
import { intro, isCancel, outro, select, text } from "@clack/prompts";
import chalk from "chalk";
import type { Config } from "../types.js";
import { loadSession } from "../utils/session.js";
import { commands as authCommands } from "./auth/index.js";

type Format =
  | "json"
  | "yaml"
  | "properties"
  | "android"
  | "ios-strings"
  | "ios-stringsdict"
  | "md"
  | "html"
  | "txt"
  | "ts"
  | "po"
  | "xliff"
  | "csv"
  | "resx"
  | "arb";

const SUPPORTED_FORMATS = [
  { value: "json" as const, label: "JSON (.json)" },
  { value: "yaml" as const, label: "YAML (.yml, .yaml)" },
  { value: "properties" as const, label: "Java Properties (.properties)" },
  { value: "android" as const, label: "Android XML (.xml)" },
  { value: "ios-strings" as const, label: "iOS Strings (.strings)" },
  {
    value: "ios-stringsdict" as const,
    label: "iOS Stringsdict (.stringsdict)",
  },
  { value: "md" as const, label: "Markdown (.md)" },
  { value: "html" as const, label: "HTML (.html)" },
  { value: "txt" as const, label: "Text (.txt)" },
  { value: "ts" as const, label: "TypeScript (.ts)" },
  { value: "po" as const, label: "Gettext PO (.po)" },
  { value: "xliff" as const, label: "XLIFF (.xlf, .xliff)" },
  { value: "csv" as const, label: "CSV (.csv)" },
  { value: "resx" as const, label: ".NET RESX (.resx)" },
  { value: "arb" as const, label: "Flutter ARB (.arb)" },
];

const FORMAT_EXAMPLES: Record<Format, string> = {
  json: "src/locales/[locale].json",
  yaml: "src/locales/[locale].yaml",
  properties: "src/locales/messages_[locale].properties",
  android: "res/values-[locale]/strings.xml",
  "ios-strings": "[locale].lproj/Localizable.strings",
  "ios-stringsdict": "[locale].lproj/Localizable.stringsdict",
  md: "src/docs/[locale]/*.md",
  html: "src/content/[locale]/**/*.html",
  txt: "src/content/[locale]/**/*.txt",
  ts: "src/locales/[locale].ts",
  po: "src/locales/[locale].po",
  xliff: "src/locales/[locale].xlf",
  csv: "src/locales/[locale].csv",
  resx: "src/locales/[locale].resx",
  arb: "lib/l10n/app_[locale].arb",
};

export async function commands() {
  intro("Initialize a new Languine configuration");

  // Check authentication first
  const session = loadSession();
  if (!session) {
    console.log(
      chalk.yellow("You need to be logged in to initialize a project."),
    );
    console.log();
    await authCommands("login");

    // Verify login was successful
    const newSession = loadSession();
    if (!newSession) {
      outro("Please try initializing again after logging in.");
      process.exit(1);
    }
  }

  // Get source language
  const sourceLanguage = (await select({
    message: "What is your source language?",
    options: [
      { value: "en", label: "English", hint: "recommended" },
      { value: "es", label: "Spanish" },
      { value: "fr", label: "French" },
      { value: "de", label: "German" },
    ],
  })) as string;

  if (isCancel(sourceLanguage)) {
    outro("Configuration cancelled");
    process.exit(0);
  }

  const targetLanguages = (await text({
    message: "What languages do you want to translate to?",
    placeholder: "es, fr, de, zh, ja, pt",
    validate: (value) => {
      if (!value) return "Please enter at least one language";
      return;
    },
  })) as string;

  if (isCancel(targetLanguages)) {
    outro("Configuration cancelled");
    process.exit(0);
  }

  // Get file configurations
  const fileConfigs: Config["files"] = {};

  // Select format
  const format = await select({
    message: "Select file format",
    options: SUPPORTED_FORMATS,
  });

  if (isCancel(format)) {
    outro("Configuration cancelled");
    process.exit(0);
  }

  const formatKey = format as keyof typeof FORMAT_EXAMPLES;

  // Get file pattern
  const pattern = await text({
    message: "Enter the file pattern for translations",
    placeholder: FORMAT_EXAMPLES[formatKey],
    defaultValue: FORMAT_EXAMPLES[formatKey],
    validate(value) {
      if (!value) return;

      if (!value.includes("[locale]")) {
        return "Path must include [locale] placeholder (e.g. src/locales/[locale].json)";
      }
    },
  });

  if (isCancel(pattern)) {
    outro("Configuration cancelled");
    process.exit(0);
  }

  // Add to file configs
  fileConfigs[format] = {
    include: [pattern],
  };

  // Check if project has TypeScript support
  const hasTypeScript =
    existsSync("tsconfig.json") || existsSync("package.json");

  let configFormat = "json";
  if (hasTypeScript) {
    const format = await select({
      message: "Select configuration format",
      options: [
        { value: "typescript", label: "TypeScript (languine.config.ts)" },
        { value: "json", label: "JSON (languine.config.json)" },
      ],
    });

    if (isCancel(format)) {
      outro("Configuration cancelled");
      process.exit(0);
    }
    configFormat = format;
  }

  // Create config file
  const config: Config = {
    projectId: "",
    locale: {
      source: sourceLanguage,
      targets: targetLanguages.split(",").map((lang) => lang.trim()),
    },
    files: fileConfigs,
  };

  try {
    const fs = await import("node:fs/promises");

    if (configFormat === "typescript") {
      const tsConfig = `import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "${sourceLanguage}",
    targets: ["${targetLanguages
      .split(",")
      .map((lang) => lang.trim())
      .join('", "')}"],
  },
  files: {
    ${format}: {
      include: [${JSON.stringify(pattern)}],
    },
  },
});
`;
      await fs.writeFile("languine.config.ts", tsConfig, "utf-8");
    } else {
      await fs.writeFile(
        "languine.config.json",
        JSON.stringify(config, null, 2),
        "utf-8",
      );
    }

    outro(chalk.green("Configuration file created successfully!"));
    console.log();
    console.log("Next steps:");
    console.log(
      `1. Review your languine.config.${configFormat === "typescript" ? "ts" : "json"} file`,
    );
    console.log("2. Run 'languine translate' to start translating your files");
    console.log();
  } catch (error) {
    outro(chalk.red("Failed to create configuration file"));
    console.error(error);
    process.exit(1);
  }
}
