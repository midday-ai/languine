import type { TranslationService } from "../types.ts";
import type { Config } from "../utils/config.ts";
import { execAsync } from "../utils/exec.ts";

export class LanguineTranslationService implements TranslationService {
  private isDevMode(): boolean {
    return process.env.DEV_MODE === "true";
  }

  private getCliCommand(cliVersion = "latest"): string {
    if (this.isDevMode()) {
      console.log("Development mode: Using local CLI");
      return "languine";
    }

    return `bunx languine@${cliVersion}`;
  }

  async runTranslation(config: Config): Promise<void> {
    const { apiKey, projectId, cliVersion } = config;

    if (this.isDevMode()) {
      console.log("Running translation in development mode");
      console.log("Project ID:", projectId);
      console.log("CLI Version:", cliVersion);
    }

    // Set environment variables for the CLI
    process.env.LANGUINE_API_KEY = apiKey;
    process.env.LANGUINE_PROJECT_ID = projectId;

    // Get the appropriate CLI command
    const cliCommand = this.getCliCommand(cliVersion);

    // Run the translation command
    await execAsync(`${cliCommand} sync`);
  }

  async hasChanges(): Promise<boolean> {
    try {
      const { stdout } = await execAsync("git status --porcelain");
      if (this.isDevMode()) {
        console.log("Checking for changes in development mode");
        console.log("Git status output:", stdout);
      }
      return stdout.trim().length > 0;
    } catch (error) {
      console.error("Error checking git status:", error);
      return false;
    }
  }

  async stageChanges(): Promise<void> {
    if (this.isDevMode()) {
      console.log("Staging changes in development mode");
    }

    await execAsync("git add .");
  }
}
