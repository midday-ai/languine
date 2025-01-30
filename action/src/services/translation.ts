import { resolve } from "node:path";
import type { GitPlatform } from "../platforms/git-platform-facade.ts";
import type { TranslationService } from "../types.ts";
import type { Config } from "../utils/config.ts";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

const GIT_CONFIG = {
  userName: "Languine Bot",
  userEmail: "bot@languine.ai",
};

export class LanguineTranslationService implements TranslationService {
  constructor(private readonly platform: GitPlatform) {}

  private getCliCommand(cliVersion = "latest"): string {
    if (process.env.DEV_MODE === "true") {
      logger.debug("Using local CLI");
      return `bun ${process.env.LANGUINE_CLI || "languine"}`;
    }

    return `bunx languine@${cliVersion}`;
  }

  private async configureGit(config: Config): Promise<boolean> {
    try {
      // Log current directory for debugging
      logger.debug("Current working directory:");
      await execAsync("pwd");
      await execAsync("ls -la");

      // Configure Git globally
      await execAsync(`git config --global safe.directory ${process.cwd()}`);
      await execAsync(`git config user.name "${GIT_CONFIG.userName}"`);
      await execAsync(`git config user.email "${GIT_CONFIG.userEmail}"`);

      // Allow platform-specific Git configuration
      await this.platform.configureGit();

      // Set up Git repository and fetch base branch
      logger.debug(`Fetching and setting up base branch: ${config.baseBranch}`);
      await execAsync(`git fetch origin ${config.baseBranch}`);

      // Create local branch tracking remote if it doesn't exist
      try {
        await execAsync(`git checkout ${config.baseBranch}`);
      } catch (error) {
        logger.debug(
          `Creating local branch tracking remote ${config.baseBranch}`,
        );
        await execAsync(
          `git checkout -b ${config.baseBranch} origin/${config.baseBranch}`,
        );
      }

      // Check if last commit was from bot to prevent loops
      const currentAuthor = `${GIT_CONFIG.userName} <${GIT_CONFIG.userEmail}>`;
      const { stdout: lastAuthor } = await execAsync(
        'git log -1 --pretty=format:"%an <%ae>"',
      );

      if (lastAuthor.trim() === currentAuthor) {
        logger.error(`The action will not run on commits by ${currentAuthor}`);
        return false;
      }

      // Handle working directory if specified
      if (config.workingDirectory) {
        const workingDir = resolve(process.cwd(), config.workingDirectory);
        if (workingDir !== process.cwd()) {
          logger.debug(
            `Changing to working directory: ${config.workingDirectory}`,
          );
          process.chdir(workingDir);
        }
      }

      return true;
    } catch (error) {
      logger.error(`Git configuration failed: ${error}`);
      return false;
    }
  }

  private async handleDirectCommit(config: Config): Promise<void> {
    logger.info("Committing changes directly to base branch");
    await this.platform.stageChanges();
    await this.platform.commitAndPush({
      message: config.commitMessage,
      branch: config.baseBranch,
    });
    logger.info(`Changes committed and pushed to ${config.baseBranch}`);
  }

  private async handlePullRequest(config: Config): Promise<void> {
    // Generate branch name using timestamp to ensure uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const branchName = `languine/translation-update-${timestamp}`;

    logger.info(`Creating new branch: ${branchName}`);
    await this.platform.createBranch(branchName);

    // Commit changes to the new branch
    await this.platform.stageChanges();
    await this.platform.commitAndPush({
      message: config.commitMessage,
      branch: branchName,
    });

    // Create pull request
    logger.info("Creating pull request");
    await this.platform.createPullRequest({
      title: config.prTitle || config.commitMessage,
      body:
        config.prBody || "This PR contains updated translations from Languine.",
      branch: branchName,
      baseBranch: config.baseBranch,
    });

    logger.info(
      `Pull request created from ${branchName} to ${config.baseBranch}`,
    );
  }

  async runTranslation(config: Config): Promise<void> {
    const { apiKey, projectId, cliVersion, createPullRequest } = config;

    // Configure Git first
    const isGitConfigured = await this.configureGit(config);
    if (!isGitConfigured) {
      throw new Error("Failed to configure Git");
    }

    // Get the appropriate CLI command
    const cliCommand = this.getCliCommand(cliVersion);

    logger.debug(`Project ID: ${projectId}`);
    logger.debug(`CLI Version: ${cliVersion}`);

    // Run translation
    const command = `${cliCommand} translate --project-id ${projectId} --api-key ${apiKey}`;
    await execAsync(command);

    // Check if there are any changes
    const hasChanges = await this.hasChanges();
    if (!hasChanges) {
      logger.info("No translation changes detected");
      return;
    }

    // Handle changes based on workflow type
    if (createPullRequest) {
      await this.handlePullRequest(config);
    } else {
      await this.handleDirectCommit(config);
    }
  }

  async hasChanges(): Promise<boolean> {
    try {
      const { stdout } = await execAsync("git status --porcelain");
      logger.debug(`Git status output: ${stdout}`);
      return stdout.trim().length > 0;
    } catch (error) {
      logger.error(`Failed to check for changes: ${error}`);
      return false;
    }
  }
}
