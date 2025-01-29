import Z from "zod";

interface BaseProviderConfig {
  baseBranchName: string;
  repositoryOwner: string;
  repositoryName: string;
}

export abstract class GitProvider<
  ProviderConfig extends BaseProviderConfig = BaseProviderConfig,
> {
  abstract branchExists(props: { branch: string }): Promise<boolean>;

  abstract getOpenPullRequestNumber(props: { branch: string }): Promise<
    number | undefined
  >;

  abstract closePullRequest(props: {
    pullRequestNumber: number;
  }): Promise<void>;

  abstract createPullRequest(props: {
    head: string;
    title: string;
    body?: string;
  }): Promise<number>;

  abstract commentOnPullRequest(props: {
    pullRequestNumber: number;
    body: string;
  }): Promise<void>;

  abstract get providerConfig(): ProviderConfig;

  abstract buildPullRequestUrl(pullRequestNumber: number): string;

  gitConfig(): Promise<void> | void {}

  get config() {
    const env = Z.object({
      LANGUINE_API_KEY: Z.string(),
      LANGUINE_PROJECT_ID: Z.string(),
      LANGUINE_PULL_REQUEST: Z.preprocess(
        (val) => val === "true" || val === true,
        Z.boolean(),
      ),
      LANGUINE_COMMIT_MESSAGE: Z.string(),
      LANGUINE_PULL_REQUEST_TITLE: Z.string(),
      LANGUINE_WORKING_DIRECTORY: Z.string().optional().default("."),
      LANGUINE_VERSION: Z.string().optional().default("latest"),
    }).parse(process.env);

    return {
      apiKey: env.LANGUINE_API_KEY,
      projectId: env.LANGUINE_PROJECT_ID,
      isPullRequestMode: env.LANGUINE_PULL_REQUEST,
      commitMessage: env.LANGUINE_COMMIT_MESSAGE,
      pullRequestTitle: env.LANGUINE_PULL_REQUEST_TITLE,
      workingDir: env.LANGUINE_WORKING_DIRECTORY,
      version: env.LANGUINE_VERSION,
    };
  }
}

export interface IConfig {
  apiKey: string;
  projectId: string;
  isPullRequestMode: boolean;
  commitMessage: string;
  pullRequestTitle: string;
  version: string;
}
