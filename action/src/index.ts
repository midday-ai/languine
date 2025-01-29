import { GitHubPlatform } from "./platforms/github.ts";
import { LanguineTranslationService } from "./services/translation.ts";
import { parseConfig } from "./utils/config.ts";

async function main() {
  try {
    const config = parseConfig();

    const gitPlatform = new GitHubPlatform();
    const translationService = new LanguineTranslationService();

    await translationService.runTranslation(config);

    // Check for changes
    const hasChanges = await translationService.hasChanges();

    if (!hasChanges) {
      console.log("No translation changes detected");
      return;
    }

    // Stage changes
    await translationService.stageChanges();

    const currentBranch = await gitPlatform.getCurrentBranch();

    if (config.createPullRequest) {
      // Create or update pull request
      await gitPlatform.createOrUpdatePullRequest({
        title: config.prTitle,
        body: config.prBody,
        branch: currentBranch,
        baseBranch: config.baseBranch,
      });
    } else {
      // Commit and push directly
      await gitPlatform.pullAndRebase(config.baseBranch);
      await gitPlatform.commitAndPush({
        message: config.commitMessage,
        branch: currentBranch,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
