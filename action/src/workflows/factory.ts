import type { TranslationService } from "../services/translation.ts";
import type { GitPlatform, GitWorkflow } from "../types.ts";
import type { Config } from "../utils/config.ts";
import { logger } from "../utils/logger.ts";
import { BranchWorkflow } from "./branch.ts";
import { PullRequestWorkflow } from "./pull-request.ts";

/**
 * Factory class for creating Git workflows.
 * Handles creation and execution of both branch and pull request workflows.
 */

export class WorkflowFactory {
  constructor(
    private readonly gitProvider: GitPlatform,
    private readonly translationService: TranslationService,
    private readonly config: Config,
  ) {}

  createWorkflow(): GitWorkflow {
    return this.config.createPullRequest
      ? new PullRequestWorkflow(this.gitProvider, this.config)
      : new BranchWorkflow(this.gitProvider, this.config);
  }

  async run(): Promise<void> {
    const workflow = this.createWorkflow();

    await workflow.preRun();

    logger.info("Setting up Git configuration...");
    if (!(await workflow.setupGitConfig())) {
      throw new Error("Failed to setup Git configuration");
    }

    logger.info("Checking for bot commit...");
    if (await workflow.checkBotCommit()) {
      logger.info("Skipping workflow as last commit was from bot");
      return;
    }

    logger.info("Setting up base branch...");
    if (!(await workflow.setupBaseBranch())) {
      throw new Error("Failed to setup base branch");
    }

    await this.translationService.runTranslation(this.config);

    logger.info("Checking for changes...");
    if (!(await workflow.hasChanges())) {
      logger.info("No changes detected, skipping workflow");
      return;
    }

    if (this.config.createPullRequest) {
      logger.info("Creating pull request...");
      if (!(await (workflow as PullRequestWorkflow).createPullRequest())) {
        throw new Error("Failed to create pull request");
      }
    } else {
      logger.info("Committing changes to branch...");
      const branchName = `languine/translations-${Date.now()}`;
      if (!(await (workflow as BranchWorkflow).commitAndPush(branchName))) {
        throw new Error("Failed to commit and push changes");
      }
    }

    await workflow.postRun();
    logger.info("Workflow completed successfully");
  }
}
