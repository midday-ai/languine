import { commands as authCommands } from "@/commands/auth/index.ts";
import { commands as initCommands } from "@/commands/init.ts";
import { localeCommand } from "@/commands/locale.ts";
import { syncCommand } from "@/commands/sync.ts";
import { translateCommand } from "@/commands/translate.ts";
import { isGitRepo } from "@/utils/git.ts";
import { isCancel, select } from "@clack/prompts";
import chalk from "chalk";

export async function runCommands() {
  const [mainCommand, subCommand, ...args] = process.argv.slice(2);

  if (!isGitRepo()) {
    console.error(
      chalk.red(
        "This command must be run from within a git repository. Please initialize git first.",
      ),
    );
    process.exit(1);
  }

  if (mainCommand) {
    switch (mainCommand) {
      case "auth":
        await authCommands(subCommand);
        break;
      case "init":
        await initCommands([...args, subCommand].filter(Boolean));
        break;
      case "translate": {
        await translateCommand([...args, subCommand].filter(Boolean));
        break;
      }
      case "sync": {
        await syncCommand([...args, subCommand].filter(Boolean));
        break;
      }
      case "locale": {
        await localeCommand([subCommand, ...args].filter(Boolean));
        break;
      }
      default:
        process.exit(1);
    }
    return;
  }

  const command = await select({
    message: "What would you like to do?",
    options: [
      { value: "init", label: "Initialize a new Languine configuration" },
      { value: "auth", label: "Manage authentication" },
      { value: "translate", label: "Translate files" },
      {
        value: "sync",
        label: "Sync deleted keys between source and target files",
      },
      {
        value: "locale",
        label: "Manage target locales",
      },
    ],
  });

  if (isCancel(command)) {
    process.exit(0);
  }

  switch (command) {
    case "auth":
      await authCommands();
      break;
    case "init":
      await initCommands();
      break;
    case "translate":
      await translateCommand();
      break;
    case "sync":
      await syncCommand();
      break;
    case "locale":
      await localeCommand();
      break;
  }
}
