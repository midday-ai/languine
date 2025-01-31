import type {
  GitPlatform,
  PullRequestWorkflow as IPullRequestWorkflow,
} from "../types.ts";
import type { Config } from "../utils/config.ts";
import { logger } from "../utils/logger.ts";

export class PullRequestWorkflow implements IPullRequestWorkflow {
  private readonly branchName: string;

  constructor(
    private readonly gitProvider: GitPlatform,
    private readonly config: Config,
  ) {
    this.branchName = `languine/translations-${Date.now()}`;
  }

  async preRun() {
    logger.info("Running before hooks...");
  }

  async postRun() {
    logger.info("Running after hooks...");
  }

  async setupGitConfig() {
    try {
      await this.gitProvider.configureGit();
      return true;
    } catch (error) {
      logger.error(`Failed to configure Git: ${error}`);
      return false;
    }
  }

  async checkBotCommit() {
    try {
      return await this.gitProvider.checkBotCommit();
    } catch (error) {
      logger.error(`Failed to check bot commit: ${error}`);
      return false;
    }
  }

  async setupBaseBranch() {
    try {
      await this.gitProvider.pullAndRebase(this.config.baseBranch);
      return true;
    } catch (error) {
      logger.error(`Failed to setup base branch: ${error}`);
      return false;
    }
  }

  async hasChanges() {
    try {
      await this.gitProvider.stageChanges();
      // We'll need to implement a way to check if there are staged changes
      // For now, we'll assume there are changes if we get here
      return true;
    } catch (error) {
      logger.error(`Failed to check for changes: ${error}`);
      return false;
    }
  }

  async createPullRequest() {
    try {
      await this.gitProvider.createBranch(this.branchName);
      await this.gitProvider.commitAndPush({
        message: this.config.commitMessage,
        branch: this.branchName,
      });

      const title = this.config.prTitle || "Update translations";
      const body =
        this.config.prBody || "This PR updates translations via Languine";

      await this.gitProvider.createOrUpdatePullRequest({
        title,
        body,
        branch: this.branchName,
        baseBranch: this.config.baseBranch,
      });

      return true;
    } catch (error) {
      logger.error(`Failed to create pull request: ${error}`);
      return false;
    }
  }
}
