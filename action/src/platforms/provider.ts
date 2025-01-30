import { type Config, ConfigSchema } from "../utils/config.ts";

/**
 * Base class for Git providers with common functionality
 */
export abstract class Provider {
  constructor(protected readonly config: Config) {
    this.validateConfig();
  }

  // Git operations
  abstract configureGit(): Promise<void>;
  abstract createBranch(name: string): Promise<void>;
  abstract stageChanges(): Promise<void>;
  abstract commitChanges(message: string): Promise<void>;
  abstract pushChanges(): Promise<void>;
  abstract hasChanges(): Promise<boolean>;
  abstract createPullRequest(title: string, body: string): Promise<void>;
  abstract getCurrentBranch(): Promise<string>;
  abstract pullAndRebase(): Promise<void>;

  protected validateConfig(): void {
    const result = ConfigSchema.safeParse(this.config);
    if (!result.success) {
      throw new Error(`Invalid config: ${result.error.message}`);
    }
  }
}
