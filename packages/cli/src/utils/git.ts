import { simpleGit } from "simple-git";

export async function getGitInfo() {
  const git = simpleGit();

  try {
    const [branchSummary, commitHash, provider, commitLink, log] =
      await Promise.all([
        git.branch(),
        git.revparse(["--short", "HEAD"]),
        getGitProvider(),
        getCommitLink(),
        git.log({ maxCount: 1 }),
      ]);

    const branchName = branchSummary.current;
    const commitMessage = log.latest?.message;

    return {
      branchName,
      commitHash,
      provider,
      commitMessage,
      commitLink,
    };
  } catch {
    return null;
  }
}

export async function getGitProvider() {
  const git = simpleGit();

  try {
    // Get the remote URL of the repository
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((remote) => remote.name === "origin");

    if (!origin || !origin.refs || !origin.refs.fetch) {
      return null;
    }

    const remoteUrl = origin.refs.fetch;

    // Check if the remote URL matches known patterns for GitHub or Bitbucket
    if (remoteUrl.includes("github.com")) {
      return "github";
    }

    if (remoteUrl.includes("bitbucket.org")) {
      return "bitbucket";
    }

    return null;
  } catch {
    return null;
  }
}

async function getCommitLink() {
  const git = simpleGit();

  try {
    // Get the repository's remote URLs
    const remotes = await git.getRemotes(true);

    // Find the remote (fallback for SSH URLs to convert them)
    const remoteUrl = remotes[0]?.refs.fetch;
    if (!remoteUrl) {
      throw new Error("No remote URL found.");
    }

    // Convert SSH remote URL to HTTPS if necessary
    let httpsUrl: string;

    if (remoteUrl.startsWith("git@")) {
      // Convert SSH URL (git@github.com:user/repo.git) to HTTPS URL (https://github.com/user/repo)
      httpsUrl = `https://${remoteUrl
        .split("@")[1]
        .replace(":", "/")
        .replace(/\.git$/, "")}`;
    } else if (remoteUrl.startsWith("https://")) {
      // For HTTPS URLs, just strip .git suffix if present
      httpsUrl = remoteUrl.replace(/\.git$/, "");
    } else {
      return null;
    }

    // Get the current branch and commit hash
    const log = await git.log({ n: 1 }); // Get the latest commit log
    const commitHash = log.latest?.hash;

    if (!commitHash) {
      return null;
    }

    // Construct the full URL to the commit
    const commitUrl = `${httpsUrl}/commit/${commitHash}`;
    return commitUrl;
  } catch {
    return null;
  }
}
