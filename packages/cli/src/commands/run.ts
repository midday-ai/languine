import { isCancel, select } from "@clack/prompts";
import { commands as authCommands } from "./auth/index.js";
import { commands as initCommands } from "./init.js";
import { translateCommand } from "./translate.js";

export async function runCommands() {
  const [mainCommand, subCommand, ...args] = process.argv.slice(2);

  if (mainCommand) {
    switch (mainCommand) {
      case "auth":
        await authCommands(subCommand);
        break;
      case "init":
        await initCommands();
        break;
      case "translate": {
        await translateCommand();
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
    case "translate": {
      await translateCommand();
      break;
    }
  }
}
