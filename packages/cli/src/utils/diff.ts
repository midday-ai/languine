import { readFileSync } from "node:fs";
import { createParser } from "@/parsers/index.ts";
import { type FileChanges, LockFileManager } from "./lock.ts";

/**
 * Detects changes between the current state and the lock file.
 * For files not in lock file, treats all keys as additions.
 * Also detects when source values change without key changes.
 * Returns an object containing arrays of added, removed and changed keys,
 * plus details about value changes.
 */
export async function getDiff({
  sourceFilePath,
  type,
}: {
  sourceFilePath: string;
  type: string;
}): Promise<FileChanges> {
  const parser = createParser({ type });
  const lockManager = new LockFileManager();

  // Parse current file content
  const currentContent = readFileSync(sourceFilePath, "utf-8");
  const currentJson = await parser.parse(currentContent);

  // Get changes using the lock manager
  return lockManager.getChanges(sourceFilePath, currentJson);
}
