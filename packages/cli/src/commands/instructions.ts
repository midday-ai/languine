import fs from "node:fs/promises";
import { intro, outro, text } from "@clack/prompts";
import chalk from "chalk";
import { configFile, getConfig } from "../utils.js";

export async function instructions() {
  intro("Let's customize your translation prompt");

  const customInstructions = await text({
    message: "Enter additional translation instructions",
    placeholder: "e.g. Use formal language, add a tone of voice",
    validate: (value) => {
      if (!value) return "Please enter some instructions";
      return;
    },
  });

  try {
    const config = await getConfig();

    // Add custom instructions to config
    config.instructions = customInstructions as string;

    // Write updated config
    const { path: configPath } = await configFile();
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");

    outro(chalk.green("Translation prompt updated successfully!"));
  } catch (error) {
    outro(chalk.red("Failed to update config file"));
    process.exit(1);
  }
}
