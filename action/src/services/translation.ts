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
      return `bun ${process.env.LANGUINE_CLI || "languine"}`;
    }

    return `bunx languine@${cliVersion}`;
  }

  private async fetchBaseBranch(baseBranch: string): Promise<void> {
    try {
      // Fetch the base branch
      await execAsync(
        `git fetch origin ${baseBranch}:refs/remotes/origin/${baseBranch}`,
      );
      if (this.isDevMode()) {
        console.log(`Fetched base branch: ${baseBranch}`);
      }
    } catch (error) {
      console.error("Error fetching base branch:", error);
      throw error;
    }
  }

  async runTranslation(config: Config): Promise<void> {
    const { apiKey, projectId, cliVersion, baseBranch = "main" } = config;

    // Get the appropriate CLI command
    const cliCommand = this.getCliCommand(cliVersion);

    if (this.isDevMode()) {
      console.log("Running translation in development mode");
      console.log("Project ID:", projectId);
      console.log("CLI Version:", cliVersion);
      console.log("Base Branch:", baseBranch);
    }

    // Fetch the base branch to ensure we can diff against it
    await this.fetchBaseBranch(baseBranch);

    // Use origin/base-branch for the diff to ensure we're comparing against the remote version
    const command = `${cliCommand} translate --project-id ${projectId} --api-key ${apiKey} --base origin/${baseBranch}`;

    await execAsync(command);
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
