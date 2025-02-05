import { spinner } from "@clack/prompts";
import { execAsync } from "./exec.ts";
import { findPreferredPM } from "./pm.ts";

const INSTALL_COMMANDS = {
  npm: "npm install languine -D",
  yarn: "yarn add languine -D",
  bun: "bun add languine -D",
  pnpm: "pnpm add languine -D",
};

export async function installDependencies() {
  const s = spinner();

  try {
    s.start("Installing Languine as a dev dependency...");

    const pm = await findPreferredPM();

    await execAsync(INSTALL_COMMANDS[pm?.name || "npm"]);

    s.stop("Languine installed successfully");
  } catch (error) {
    s.stop("Failed to install Languine dev dependency");

    throw error;
  }
}
