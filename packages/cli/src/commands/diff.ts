import { execSync } from "node:child_process";
import { intro, outro } from "@clack/prompts";
import chalk from "chalk";
import { getConfig } from "../utils.js";

export async function diff() {
  intro("Checking for changes in source locale file...");

  try {
    const config = await getConfig();

    // Get source locale file path from config
    const sourceLocale = config.locale.source;
    const [fileFormat] = Object.keys(config.files);
    const sourcePattern = config.files[fileFormat].include[0];
    const sourcePath =
      typeof sourcePattern === "string"
        ? sourcePattern.replace("[locale]", sourceLocale)
        : sourcePattern.from.replace("[locale]", sourceLocale);

    // Get git diff for source file
    const diff = execSync(`git diff HEAD -- ${sourcePath}`, {
      encoding: "utf-8",
    });

    if (!diff) {
      outro(chalk.yellow("No changes detected in source locale file."));
      process.exit(0);
    }

    let added = 0;
    let removed = 0;

    for (const line of diff.split("\n")) {
      if (line.startsWith("+") && !line.startsWith("+++")) added++;
      else if (line.startsWith("-") && !line.startsWith("---")) removed++;
    }

    if (added === 0 && removed === 0) {
      outro(
        chalk.yellow("No translation keys were added, modified or removed."),
      );
      process.exit(0);
    }

    const totalChanges = added + removed;
    outro(
      chalk.blue(
        `Found ${totalChanges} translation key${totalChanges === 1 ? "" : "s"} changed`,
      ),
    );

    return {
      addedKeys: [],
      removedKeys: [],
    };
  } catch (error) {
    outro(chalk.red("Failed to check for changes"));
    console.error(error);
    process.exit(1);
  }
}
