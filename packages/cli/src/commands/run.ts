import { isCancel } from "@clack/prompts";
import { commands as authCommands } from "./auth/index.js";
import { commands as initCommands } from "./init.js";

export async function runCommands() {
  const [mainCommand, subCommand] = process.argv.slice(2);

  if (mainCommand) {
    switch (mainCommand) {
      case "auth":
        await authCommands(subCommand);
        break;
      case "init":
        await initCommands();
        break;
      default:
        process.exit(1);
    }
    return;
  }

  const command = await initCommands();

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
  }
}
