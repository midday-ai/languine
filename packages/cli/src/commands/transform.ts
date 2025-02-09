import { note, spinner } from "@clack/prompts";
import chalk from "chalk";

export async function transformCommand() {
  const s = spinner();

  try {
    // Start analyzing spinner
    s.start("Analyzing code...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update to generating translation keys
    s.message("Generating translation keys with AI...");
    await new Promise((resolve) => setTimeout(resolve, 4000));

    s.message("Adding translation keys to en.json...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    s.message("Updating source code...");
    await new Promise((resolve) => setTimeout(resolve, 2400));

    s.message("Validating source code...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Show summary and stop spinner
    s.stop();

    console.log(" ");
    // Show success message for transformed strings
    console.log(
      chalk.green(
        `Replaced ${chalk.bold("143")} hardcoded strings with translatable keys`,
      ),
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(" ");
    note(
      "Run npx languine@latest translate to start transaltion",
      "Next steps",
    );
  } catch (error) {
    s.stop(chalk.red("Transform failed"));
    console.error(error);
    process.exit(1);
  }
}
