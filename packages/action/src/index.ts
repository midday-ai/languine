import { GitProviderFactory } from "./platforms/git-provider-factory.ts";
import { TranslationService } from "./services/translation.ts";
import { parseConfig } from "./utils/config.ts";
import { logger } from "./utils/logger.ts";
import { WorkflowFactory } from "./workflows/factory.ts";

async function main() {
  try {
    const config = parseConfig();

    const gitProvider = GitProviderFactory.getInstance().getProvider();
    const translationService = new TranslationService();

    const workflow = new WorkflowFactory(
      gitProvider,
      translationService,
      config,
    );

    await workflow.run();
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Unknown error occurred",
    );
    process.exit(1);
  }
}

main();
