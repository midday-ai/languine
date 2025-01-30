import { GitHubProvider } from "./github-provider.ts";
import type { Provider } from "./provider.ts";

/**
 * Factory class for creating Git provider instances.
 * Currently supports GitHub, but can be extended for other platforms.
 */
export class GitProviderFactory {
  private static instance: GitProviderFactory;
  private provider: Provider;

  private constructor() {
    // Currently only supporting GitHub, but this can be extended
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
  public getProvider(): Provider {
    return this.provider;
  }
}
