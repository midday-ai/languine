import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import YAML from "yaml";
import { z } from "zod";

const LockFileSchema = z.object({
  version: z.literal(1).default(1),
  files: z
    .record(
      z.string(), // file path
      z
        .record(
          z.string(), // translation key
          z.object({
            hash: z.string(), // MD5 hash of the value
          }),
        )
        .default({}),
    )
    .default({}),
});

type LockFile = z.infer<typeof LockFileSchema>;

export interface FileChanges {
  addedKeys: string[];
  removedKeys: string[];
  changedKeys: string[];
  valueChanges: Array<{
    key: string;
    oldValue: string;
    newValue: string;
  }>;
}

export function createLockFileHelper() {
  return {
    /**
     * Check if the lock file exists
     */
    isLockFileExists(): boolean {
      return existsSync(getLockFilePath());
    },

    /**
     * Register all source data for a file path
     */
    registerSourceData(
      filePath: string,
      sourceData: Record<string, string>,
    ): void {
      const lockFile = loadLockFile();
      const relativePath = relative(process.cwd(), filePath);

      // Create or update file entry
      lockFile.files[relativePath] = {};

      // Update each key's hash
      for (const [key, value] of Object.entries(sourceData)) {
        lockFile.files[relativePath][key] = {
          hash: hashValue(value),
        };
      }

      saveLockFile(lockFile);
    },

    /**
     * Register partial source data for a file path, merging with existing data
     */
    registerPartialSourceData(
      filePath: string,
      partialSourceData: Record<string, string>,
    ): void {
      const lockFile = loadLockFile();
      const relativePath = relative(process.cwd(), filePath);

      // Create file entry if it doesn't exist
      if (!lockFile.files[relativePath]) {
        lockFile.files[relativePath] = {};
      }

      // Update each key's hash
      for (const [key, value] of Object.entries(partialSourceData)) {
        lockFile.files[relativePath][key] = {
          hash: hashValue(value),
        };
      }

      saveLockFile(lockFile);
    },

    /**
     * Get changes between current source data and lock file
     */
    getChanges(
      filePath: string,
      sourceData: Record<string, string>,
    ): FileChanges {
      const lockFile = loadLockFile();
      const relativePath = relative(process.cwd(), filePath);
      const previousState = lockFile.files[relativePath] || {};

      const currentKeys = Object.keys(sourceData).sort();
      const previousKeys = Object.keys(previousState);

      // If file is not in lock file, treat all keys as additions
      if (!previousKeys.length) {
        this.registerSourceData(filePath, sourceData);
        return {
          addedKeys: currentKeys,
          removedKeys: [],
          changedKeys: [],
          valueChanges: currentKeys.map((key) => ({
            key,
            oldValue: "",
            newValue: sourceData[key],
          })),
        };
      }

      // Create sets for more efficient lookups
      const currentKeysSet = new Set(currentKeys);
      const previousKeysSet = new Set(previousKeys);

      // Track value changes for existing keys
      const valueChanges = currentKeys
        .filter((key) => {
          if (!previousKeysSet.has(key)) return false;
          const currentHash = hashValue(sourceData[key]);
          return currentHash !== previousState[key].hash;
        })
        .map((key) => ({
          key,
          oldValue: sourceData[key], // Use current value since we don't store old values
          newValue: sourceData[key],
        }));

      const result = {
        // New keys that don't exist in lock file
        addedKeys: currentKeys.filter((key) => !previousKeysSet.has(key)),
        // Keys that existed in lock file but were removed
        removedKeys: previousKeys.filter((key) => !currentKeysSet.has(key)),
        // Keys that exist in both but have different values
        changedKeys: valueChanges.map((change) => change.key),
        // Detailed value changes
        valueChanges,
      };

      // Update lock file with current state
      this.registerSourceData(filePath, sourceData);

      return result;
    },

    /**
     * Clear all data from the lock file
     */
    clearLockFile(): void {
      saveLockFile(LockFileSchema.parse({}));
    },
  };
}

function hashValue(value: string): string {
  return createHash("md5").update(value).digest("hex");
}

function getLockFilePath(): string {
  return join(process.cwd(), "languine.lock");
}

function loadLockFile(): LockFile {
  const lockFilePath = getLockFilePath();
  if (!existsSync(lockFilePath)) {
    return LockFileSchema.parse({});
  }
  try {
    const content = readFileSync(lockFilePath, "utf-8");
    return LockFileSchema.parse(YAML.parse(content));
  } catch (error) {
    if (process.env.DEV_MODE === "true") {
      console.error("Error reading lock file:", error);
    }
    return LockFileSchema.parse({});
  }
}

function saveLockFile(lockFile: LockFile): void {
  const lockFilePath = getLockFilePath();
  const content = YAML.stringify(lockFile);
  writeFileSync(lockFilePath, content);
}
