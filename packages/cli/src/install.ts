import { spinner } from "@clack/prompts";
import { execAsync, findPreferredPM } from "./utils.js";

function installCommand(name?: string) {
  switch (name) {
    case "yarn":
      return "yarn add languine --dev";
    case "npm":
      return "npm install languine --save-dev";
    case "pnpm":
      return "pnpm add languine -D";
    case "bun":
      return "bun add languine -D";
    default:
      return `${name} install languine -D`;
  }
}

export async function installDependencies() {
  const s = spinner();

  try {
    s.start("Installing Languine as a dev dependency...");

    const pm = await findPreferredPM();

    await execAsync(installCommand(pm?.name));

    s.stop("Languine installed successfully");
  } catch (error) {
    s.stop("Failed to install Languine");
    throw error;
  }
}
