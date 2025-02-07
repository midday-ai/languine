import { readFile, writeFile } from "node:fs/promises";
import { loadConfig } from "@/utils/config.ts";
import { configFile } from "@/utils/config.ts";
import { outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import { z } from "zod";

const argsSchema = z.array(z.string()).transform((args) => {
  const [command, ...locales] = args;
  const localeList = locales
    .join("")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean); // Filter out empty strings

  return {
    command,
    locales: localeList,
  };
});

export async function localeCommand(args: string[] = []) {
  const { command, locales } = argsSchema.parse(args);
  const s = spinner();

  if (!command || !["add", "remove"].includes(command)) {
    throw new Error("Please specify a command: add or remove");
  }

  if (locales.length === 0) {
    throw new Error("Please specify at least one locale code");
  }

  try {
    // Load config file
    const config = await loadConfig();
    const { path: configPath } = await configFile();

    if (!config) {
      throw new Error(
        "Configuration file not found. Please run `npx languine init` to create one.",
      );
    }

    s.start(command === "add" ? "Adding locales..." : "Removing locales...");

    // Read the current config file content
    const configContent = await readFile(configPath, "utf-8");

    let updatedContent = configContent;
    const currentTargets = config.locale.targets;

    if (command === "add") {
      // Add new locales that don't already exist
      const newLocales = locales.filter(
        (locale) => !currentTargets.includes(locale),
      );

      if (newLocales.length === 0) {
        s.stop("No new locales to add");
        outro("All specified locales are already in the configuration.");
        return;
      }

      const updatedTargets = [...currentTargets, ...newLocales];
      updatedContent = updateTargetsInConfig(configContent, updatedTargets);

      s.stop("Locales added successfully");
      outro(`Added locales: ${newLocales.join(", ")}`);
    } else {
      // Remove specified locales
      const localesToRemove = locales.filter((locale) =>
        currentTargets.includes(locale),
      );

      if (localesToRemove.length === 0) {
        s.stop("No locales to remove");
        outro("None of the specified locales exist in the configuration.");
        return;
      }

      const updatedTargets = currentTargets.filter(
        (locale) => !localesToRemove.includes(locale),
      );
      updatedContent = updateTargetsInConfig(configContent, updatedTargets);

      s.stop("Locales removed successfully");
      outro(`Removed locales: ${localesToRemove.join(", ")}`);
    }

    // Write the updated config back to file
    await writeFile(configPath, updatedContent, "utf-8");
  } catch (error) {
    const localeError = error as Error;
    console.error(chalk.red(`Locale command failed: ${localeError.message}`));
    process.exit(1);
  }
}

function updateTargetsInConfig(
  configContent: string,
  targets: string[],
): string {
  const config = JSON.parse(configContent);
  config.locale.targets = targets;
  return JSON.stringify(config, null, 2);
}
