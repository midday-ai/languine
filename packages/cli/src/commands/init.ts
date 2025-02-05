import { intro, isCancel, note, outro, select, text } from "@clack/prompts";
import chalk from "chalk";
import { z } from "zod";
import type { parserTypeSchema } from "../parsers/index.js";
import type { Config } from "../types.js";
import { loadSession } from "../utils/session.js";
import { commands as authCommands } from "./auth/index.js";

const argsSchema = z.array(z.string()).transform((args) => {
  const projectIdIndex = args.findIndex((arg) => arg.startsWith("--p="));
  return {
    projectId:
      projectIdIndex !== -1 ? args[projectIdIndex].slice(4) : undefined,
  };
});

type Format = typeof parserTypeSchema._type;

const SUPPORTED_FORMATS = [
  { value: "json", label: "JSON (.json)" },
  { value: "yaml", label: "YAML (.yml, .yaml)" },
  { value: "properties", label: "Java Properties (.properties)" },
  { value: "android", label: "Android (.xml)" },
  { value: "xcode-strings", label: "iOS Strings (.strings)" },
  { value: "xcode-stringsdict", label: "iOS Stringsdict (.stringsdict)" },
  { value: "xcode-xcstrings", label: "iOS XCStrings (.xcstrings)" },
  { value: "md", label: "Markdown (.md)" },
  { value: "mdx", label: "MDX (.mdx)" },
  { value: "html", label: "HTML (.html)" },
  { value: "js", label: "JavaScript (.js)" },
  { value: "ts", label: "TypeScript (.ts)" },
  { value: "po", label: "Gettext PO (.po)" },
  { value: "xliff", label: "XLIFF (.xlf, .xliff)" },
  { value: "csv", label: "CSV (.csv)" },
  { value: "xml", label: "XML (.xml)" },
  { value: "arb", label: "Flutter ARB (.arb)" },
] as const;

const FORMAT_EXAMPLES: Record<Format, string> = {
  json: "src/locales/[locale].json",
  yaml: "src/locales/[locale].yaml",
  properties: "src/locales/messages_[locale].properties",
  android: "res/values-[locale]/strings.xml",
  "xcode-strings": "[locale].lproj/Localizable.strings",
  "xcode-stringsdict": "[locale].lproj/Localizable.stringsdict",
  "xcode-xcstrings": "[locale].lproj/Localizable.xcstrings",
  md: "src/docs/[locale]/*.md",
  mdx: "src/docs/[locale]/*.mdx",
  html: "src/content/[locale]/**/*.html",
  js: "src/locales/[locale].js",
  ts: "src/locales/[locale].ts",
  po: "src/locales/[locale].po",
  xliff: "src/locales/[locale].xlf",
  csv: "src/locales/[locale].csv",
  xml: "src/locales/[locale].xml",
  arb: "lib/l10n/app_[locale].arb",
};

export async function commands(args: string[] = []) {
  const { projectId } = argsSchema.parse(args);
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
  const format = (await select({
    message: "Select file format",
    options: [...SUPPORTED_FORMATS],
  })) as Format;

  if (isCancel(format)) {
    outro("Configuration cancelled");
    process.exit(0);
  }

  // Get file pattern
  const pattern = await text({
    message: "Enter the file pattern for translations",
    placeholder: FORMAT_EXAMPLES[format],
    defaultValue: FORMAT_EXAMPLES[format],
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

  // Create config file
  const config: Config = {
    projectId: projectId || "",
    locale: {
      source: sourceLanguage,
      targets: targetLanguages.split(",").map((lang) => lang.trim()),
    },
    files: fileConfigs,
  };

  try {
    const fs = await import("node:fs/promises");

    await fs.writeFile(
      "languine.config.json",
      JSON.stringify(config, null, 2),
      "utf-8",
    );

    outro(chalk.green("Configuration file created successfully!"));
    console.log();

    note(
      `Run 'languine translate' to start translating your files`,
      "Next steps.",
    );

    console.log();

    outro(
      `Problems? ${chalk.underline(chalk.cyan("https://git.new/problem"))}`,
    );
  } catch (error) {
    outro(chalk.red("Failed to create configuration file"));
    console.error(error);
    process.exit(1);
  }
}
