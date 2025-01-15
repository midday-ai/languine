import { select } from "@clack/prompts";
import { isCancel } from "@clack/prompts";
import { loginCommand } from "./login.js";

export async function commands(subCommand?: string) {
  if (subCommand) {
    switch (subCommand) {
      case "login":
        await loginCommand();
        break;
      case "logout":
        // Handle logout
        break;
      case "token":
        // Show auth token
        break;
      case "whoami":
        // Show current user
        break;
      default:
        console.error("Unknown auth subcommand:", subCommand);
        process.exit(1);
    }
    return;
  }

  const authCommand = await select({
    message: "What would you like to do?",
    options: [
      { value: "login", label: "Login to the platform." },
      { value: "logout", label: "Log out currently logged in user." },
      {
        value: "token",
        label:
          "Shows the token used to authenticate you to Languine platform API.",
      },
      { value: "whoami", label: "Show the currently logged in user." },
    ],
  });

  if (isCancel(authCommand)) {
    process.exit(0);
  }

  await commands(authCommand as string);
}
