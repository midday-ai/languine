import { GitPlatformFacade } from "./platforms/git-platform-facade.ts";
import { LanguineTranslationService } from "./services/translation.ts";
import { parseConfig } from "./utils/config.ts";
import { logger } from "./utils/logger.ts";

async function main() {
  try {
    const config = parseConfig();

    const gitPlatform = GitPlatformFacade.getInstance();
    const translationService = new LanguineTranslationService();

    await translationService.runTranslation(config);

    const hasChanges = await translationService.hasChanges();

    if (!hasChanges) {
      logger.info("No translation changes detected");
      return;
    }

    await translationService.stageChanges();

    const currentBranch = await gitPlatform.getCurrentBranch();

    if (config.createPullRequest) {
      await gitPlatform.createOrUpdatePullRequest({
        title: config.prTitle,
        body: config.prBody,
        branch: currentBranch,
        baseBranch: config.baseBranch,
      });
    } else {
      await gitPlatform.pullAndRebase(config.baseBranch);
      await gitPlatform.commitAndPush({
        message: config.commitMessage,
        branch: currentBranch,
      });
    }
  } catch (error) {
    logger.error(error instanceof Error ? error : String(error));
    process.exit(1);
  }
}

main();
