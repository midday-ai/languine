import { spinner } from "@clack/prompts";
import { execAsync } from "./exec.ts";
import { findPreferredPM } from "./pm.ts";

export async function installDependencies() {
  const s = spinner();

  try {
    s.start("Installing Languine as a dev dependency...");

    const pm = await findPreferredPM();

    await execAsync(`${pm?.name} install languine -D`);

    s.stop("Languine installed successfully");
  } catch (error) {
    s.stop("Failed to install Languine");
    throw error;
  }
}
