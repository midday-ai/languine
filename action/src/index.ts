import { GitPlatformFacade } from "./platforms/git-platform-facade.ts";
import { LanguineTranslationService } from "./services/translation.ts";
import { parseConfig } from "./utils/config.ts";
import { logger } from "./utils/logger.ts";

async function main() {
  try {
    const config = parseConfig();

    const gitPlatform = GitPlatformFacade.getInstance();
    const translationService = new LanguineTranslationService(gitPlatform);

    await translationService.runTranslation(config);
  } catch (error) {
    logger.error(error instanceof Error ? error : String(error));
    process.exit(1);
  }
}

main();
