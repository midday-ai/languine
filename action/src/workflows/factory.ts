import type { TranslationService } from "../services/translation.ts";
import type { GitPlatform } from "../types.ts";
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

  createWorkflow() {
    return this.config.createPullRequest
      ? new PullRequestWorkflow(
          this.gitProvider,
          this.config,
          this.translationService,
        )
      : new BranchWorkflow(
          this.gitProvider,
          this.config,
          this.translationService,
        );
  }

  async run() {
    const workflow = this.createWorkflow();

    // Run before hooks
    logger.info("Running before hooks...");
    await workflow.preRun();

    // Run workflow
    logger.info("Running workflow...");
    await workflow.run();

    // Run after hooks
    logger.info("Running after hooks...");
    await workflow.postRun();

    logger.info("Workflow completed successfully");
  }
}
