import { execSync } from "node:child_process";
import path from "node:path";
import type { TranslationService } from "../services/translation.ts";
import type { GitPlatform, GitWorkflow } from "../types.ts";
import type { Config } from "../utils/config.ts";
import { logger } from "../utils/logger.ts";

export class PullRequestWorkflow implements GitWorkflow {
  private readonly branchName: string;

  constructor(
    private readonly gitProvider: GitPlatform,
    private readonly config: Config,
    private readonly translationService: TranslationService,
  ) {
    const { baseBranch } = this.gitProvider.getPlatformConfig();
    this.branchName = `languine/${baseBranch}`;
  }

  async preRun(): Promise<void> {
    try {
      await this.#setupGit();
      logger.info("Successfully configured Git");

      // Get base branch from config
      const { baseBranch } = this.gitProvider.getPlatformConfig();

      // Make sure we're on the base branch first
      logger.info(`Checking out base branch ${baseBranch}`);
      await this.#fetchAndCheckoutBaseBranch(baseBranch);

      // Run translation service on base branch to detect changes
      logger.info("Running translation service to detect changes...");
      await this.translationService.runTranslation(this.config);

      // Check if we have any changes before proceeding
      const hasChanges = await this.gitProvider.hasChanges();
      if (!hasChanges) {
        logger.info("No translation changes detected, skipping PR creation");
        return;
      }

      // Now handle the feature branch
      const branchExists = await this.#checkBranchExists(this.branchName);
      logger.info(branchExists ? "Branch exists" : "Branch does not exist");

      if (branchExists) {
        logger.info(`Checking out branch ${this.branchName}`);
        await this.#checkoutExistingBranch(this.branchName);
        logger.info(`Syncing with ${baseBranch}`);
        await this.#syncBranch(baseBranch);
      } else {
        logger.info(`Creating new branch ${this.branchName}`);
        await this.#createNewBranch(this.branchName, baseBranch);
      }

      // Stage the changes we detected
      await this.gitProvider.addChanges();
    } catch (error) {
      logger.error(error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  async run(): Promise<boolean> {
    logger.info("Running pull request workflow...");

    try {
      // Check if we have any changes to commit
      const hasChanges = await this.gitProvider.hasChanges();

      if (hasChanges) {
        logger.info("Changes detected, committing and pushing...");
        await this.gitProvider.commitAndPush({
          message: this.config.commitMessage,
          branch: this.branchName,
        });
      } else {
        logger.info("No changes to commit");
      }

      return hasChanges;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : "Unknown error");
      return false;
    }
  }

  async postRun(): Promise<void> {
    try {
      // Only create PR if we have changes
      const hasChanges = await this.gitProvider.hasChanges();
      if (!hasChanges) {
        logger.info("No changes detected, skipping PR creation");
        return;
      }

      // Check for existing PR again (in case it was created during our run)
      const existingPRNumber = await this.gitProvider.getOpenPullRequestNumber(
        this.branchName,
      );

      // Create new PR
      logger.info("Creating new pull request...");
      await this.gitProvider.createOrUpdatePullRequest({
        title: this.config.prTitle || "chore: update translations",
        body: this.config.prBody || this.#getPrBodyContent(),
        branch: this.branchName,
      });

      // If there was an existing PR, add a comment about the new one
      if (existingPRNumber) {
        logger.info(`Adding comment to old PR #${existingPRNumber}`);
        await this.gitProvider.addCommentToPullRequest({
          pullRequestNumber: existingPRNumber,
          body: "This PR is now outdated. A new version has been created.",
        });
      }
    } catch (error) {
      logger.error(error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  async #setupGit() {
    await this.gitProvider.setupGit();

    const workingDir = path.resolve(
      process.cwd(),
      this.config?.workingDirectory,
    );

    if (workingDir !== process.cwd()) {
      logger.info(`Changing working directory to: ${workingDir}`);
      process.chdir(workingDir);
    }
  }

  async #checkBranchExists(branch: string): Promise<boolean> {
    try {
      execSync(`git fetch origin ${branch}`, { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  async #fetchAndCheckoutBaseBranch(baseBranch: string) {
    execSync(`git fetch origin ${baseBranch}`, { stdio: "inherit" });
    execSync(`git checkout ${baseBranch}`, { stdio: "inherit" });
    execSync(`git reset --hard origin/${baseBranch}`, { stdio: "inherit" });
  }

  async #checkoutExistingBranch(branch: string) {
    execSync(`git fetch origin ${branch}`, { stdio: "inherit" });
    execSync(`git checkout -B ${branch} origin/${branch}`, {
      stdio: "inherit",
    });
  }

  async #createNewBranch(branch: string, baseBranch: string) {
    execSync(`git fetch origin ${baseBranch}`, { stdio: "inherit" });
    execSync(`git checkout -b ${branch} origin/${baseBranch}`, {
      stdio: "inherit",
    });
  }

  async #syncBranch(baseBranch: string) {
    try {
      logger.info("Attempting to rebase branch");
      execSync(`git fetch origin ${baseBranch}`, { stdio: "inherit" });
      execSync(`git rebase origin/${baseBranch}`, { stdio: "inherit" });
      logger.info("Successfully rebased branch");
    } catch (error) {
      logger.warn("Rebase failed, falling back to alternative sync method");

      logger.info("Aborting failed rebase");
      execSync("git rebase --abort", { stdio: "inherit" });

      logger.info(`Resetting to ${baseBranch}`);
      execSync(`git reset --hard origin/${baseBranch}`, { stdio: "inherit" });

      logger.info("Restoring target files");
      const targetFiles = ["i18n.lock"];
      execSync(`git fetch origin ${this.branchName}`, { stdio: "inherit" });

      // Restore each file from the feature branch
      for (const file of targetFiles) {
        try {
          execSync(`git checkout FETCH_HEAD -- ${file}`, { stdio: "inherit" });
        } catch (error) {
          logger.warn(`Skipping non-existent file: ${file}`);
        }
      }
      logger.info("Restored target files");
    }
  }

  #getPrBodyContent(): string {
    return `
🌐 Translation Updates

This PR contains automated translation updates from Languine.ai. The changes have been automatically generated and quality-checked.

### What Changed
- Updated translations to match latest source strings
- Maintained consistent terminology across languages
- Preserved existing translations where possible
- Applied quality checks and formatting

### Next Steps
1. Review the changes, focusing on key user-facing strings
2. Test the translations in context if possible
3. Approve and merge when ready

> Need help or have questions? Visit our [documentation](https://languine.ai/docs) or [contact support](https://languine.ai/support).

---
_Generated by [Languine](https://languine.ai) - Automated Translation Infrastructure_
    `.trim();
  }
}
