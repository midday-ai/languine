import { spinner } from "@clack/prompts";
import { execAsync, findPreferredPM } from "./utils.js";

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
