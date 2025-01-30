import { GitProviderFactory } from "./platforms/git-provider-factory.ts";
import { LanguineTranslationService } from "./services/translation.ts";
import { parseConfig } from "./utils/config.ts";
import { logger } from "./utils/logger.ts";

async function main() {
  try {
    const config = parseConfig();

    // Initialize Git provider and translation service
    const gitProvider = GitProviderFactory.getInstance().getProvider();
    const translationService = new LanguineTranslationService(gitProvider);

    // Run translation process
    await translationService.runTranslation(config);
  } catch (error) {
    logger.error(error instanceof Error ? error : String(error));
    process.exit(1);
  }
}

main();
