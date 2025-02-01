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
    this.branchName = `languine/translations-${Date.now()}`;
  }

  async preRun() {}

  async run() {
    logger.info("Running pull request workflow...");

    return true;
  }

  async postRun() {}
}
