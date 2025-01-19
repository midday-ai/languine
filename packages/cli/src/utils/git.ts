import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Check if the current directory is within a git repository
 * Traverses up the directory tree until it finds a .git directory or reaches the root
 * @returns {boolean} True if within a git repository
 */
export function isGitRepo(startPath: string = process.cwd()): boolean {
  const gitDir = join(startPath, ".git");

  if (existsSync(gitDir)) {
    return true;
  }

  const parentDir = dirname(startPath);
  // If we've reached the root directory
  if (parentDir === startPath) {
    return false;
  }

  return isGitRepo(parentDir);
}
