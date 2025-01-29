import { GitHubPlatformKit } from "./github.js";

export const getPlatformKit = () => {
  if (process.env.GITHUB_ACTION) {
    return new GitHubPlatformKit();
  }

  throw new Error("Unsupported platform");
};
