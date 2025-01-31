import { type Config, ConfigSchema } from "../utils/config.ts";

interface PlatformConfig {
  baseBranch: string;
  owner: string;
  repo: string;
}

export abstract class PlatformProvider {
  constructor(protected readonly config: Config) {
    this.validateAndThrowIfInvalid();
  }

  abstract doesBranchExist(params: { branch: string }): Promise<boolean>;

  abstract fetchOpenPullRequestNumber(params: { branch: string }): Promise<
    number | undefined
  >;

  abstract closeOpenPullRequest(params: {
    pullRequestNumber: number;
  }): Promise<void>;

  abstract createPullRequest(params: {
    head: string;
    title: string;
    body?: string;
  }): Promise<number>;

  abstract addCommentToPullRequest(params: {
    pullRequestNumber: number;
    body: string;
  }): Promise<void>;

  abstract get platformConfig(): PlatformConfig;

  abstract buildPullRequestUrl(pullRequestNumber: number): string;

  private validateAndThrowIfInvalid(): void {
    const result = ConfigSchema.safeParse(this.config);

    if (!result.success) {
      throw new Error(`Invalid config: ${result.error.message}`);
    }
  }
}
