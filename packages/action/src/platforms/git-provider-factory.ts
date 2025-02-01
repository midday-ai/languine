import type { GitPlatform } from "../types.ts";
import { GitHubProvider } from "./github.ts";

/**
 * Factory class for creating Git provider instances.
 * Currently supports GitHub, but can be extended for other platforms.
 */
export class GitProviderFactory {
  private static instance: GitProviderFactory;
  private provider: GitPlatform;

  private constructor() {
    // For now, we only support GitHub
    this.provider = new GitHubProvider();
  }

  /**
   * Get the singleton instance of the factory
   */
  public static getInstance(): GitProviderFactory {
    if (!GitProviderFactory.instance) {
      GitProviderFactory.instance = new GitProviderFactory();
    }

    return GitProviderFactory.instance;
  }

  /**
   * Get the Git provider instance
   */
  public getProvider(): GitPlatform {
    return this.provider;
  }
}
