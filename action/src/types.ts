import type { Config } from "./utils/config.ts";

export interface GitPlatform {
  createOrUpdatePullRequest(options: {
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
  }): Promise<void>;
  getCurrentBranch(): Promise<string>;
  commitAndPush(options: {
    message: string;
    branch: string;
  }): Promise<void>;
  pullAndRebase(branch: string): Promise<void>;
}

export interface TranslationService {
  runTranslation(config: Config): Promise<void>;
  hasChanges(): Promise<boolean>;
}
