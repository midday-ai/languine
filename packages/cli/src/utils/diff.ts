import { readFileSync } from "node:fs";
import simpleGit from "simple-git";

/**
 * Detects changes between current and previous version of a file in git
 */
export async function detectChanges(filePath: string) {
  try {
    // Initialize git
    const git = simpleGit();

    // Read the current version from the file system
    const currentFile = readFileSync(filePath, "utf8");

    // Fetch the previous version from git
    const previousFile = await git.show([`HEAD:${filePath}`]);

    // Parse JSON for both versions
    const currentJson = JSON.parse(currentFile);
    const previousJson = JSON.parse(previousFile);

    // Extract keys
    const currentKeys = Object.keys(currentJson);
    const previousKeys = Object.keys(previousJson);

    // Detect added, removed, and changed keys
    const addedKeys = currentKeys.filter((key) => !previousKeys.includes(key));
    const removedKeys = previousKeys.filter(
      (key) => !currentKeys.includes(key),
    );
    const changedKeys = currentKeys.filter(
      (key) =>
        previousKeys.includes(key) && currentJson[key] !== previousJson[key],
    );

    return {
      addedKeys,
      removedKeys,
      changedKeys,
    };
  } catch (error) {
    console.error("Error detecting changes:", error);
    throw error;
  }
}
