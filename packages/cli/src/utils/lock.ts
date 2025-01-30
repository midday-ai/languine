import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import YAML from "yaml";
import { z } from "zod";

const LockFileSchema = z.object({
  version: z.literal(1).default(1),
  files: z
    .record(z.string(), z.record(z.string(), z.string()).default({}))
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

export class LockFileManager {
  private lockFile: LockFile;
  private readonly lockFilePath: string;

  constructor(workingDir: string = process.cwd()) {
    this.lockFilePath = join(workingDir, "languine.lock");
    this.lockFile = this.loadLockFile();
  }

  public isLockFileExists(): boolean {
    return existsSync(this.lockFilePath);
  }

  public registerSourceData(
    filePath: string,
    sourceData: Record<string, string>,
  ): void {
    const relativePath = relative(process.cwd(), filePath);

    this.lockFile.files[relativePath] = {};

    for (const [key, value] of Object.entries(sourceData)) {
      this.lockFile.files[relativePath][key] = this.hashValue(value);
    }

    this.saveLockFile();
  }

  public registerPartialSourceData(
    filePath: string,
    partialSourceData: Record<string, string>,
  ): void {
    const relativePath = relative(process.cwd(), filePath);

    if (!this.lockFile.files[relativePath]) {
      this.lockFile.files[relativePath] = {};
    }

    for (const [key, value] of Object.entries(partialSourceData)) {
      this.lockFile.files[relativePath][key] = this.hashValue(value);
    }

    this.saveLockFile();
  }

  public getChanges(
    filePath: string,
    sourceData: Record<string, string>,
  ): FileChanges {
    const relativePath = relative(process.cwd(), filePath);
    const previousState = this.lockFile.files[relativePath] || {};

    const currentKeys = Object.keys(sourceData).sort();
    const previousKeys = Object.keys(previousState);

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

    const currentKeysSet = new Set(currentKeys);
    const previousKeysSet = new Set(previousKeys);

    const addedKeys = currentKeys.filter((key) => !previousKeysSet.has(key));
    const removedKeys = previousKeys.filter((key) => !currentKeysSet.has(key));

    const changedValues = currentKeys
      .filter((key) => {
        if (!previousKeysSet.has(key)) return false;
        const currentHash = this.hashValue(sourceData[key]);
        return currentHash !== previousState[key];
      })
      .map((key) => ({
        key,
        oldValue: sourceData[key],
        newValue: sourceData[key],
      }));

    const addedValues = addedKeys.map((key) => ({
      key,
      oldValue: "",
      newValue: sourceData[key],
    }));

    const result = {
      addedKeys,
      removedKeys,
      changedKeys: changedValues.map((change) => change.key),
      valueChanges: [...changedValues, ...addedValues],
    };

    this.registerSourceData(filePath, sourceData);

    return result;
  }

  public clearLockFile(): void {
    this.lockFile = LockFileSchema.parse({});
    this.saveLockFile();
  }

  public reload(): void {
    this.lockFile = this.loadLockFile();
  }

  private hashValue(value: string): string {
    return createHash("md5").update(value).digest("hex");
  }

  private loadLockFile(): LockFile {
    if (!existsSync(this.lockFilePath)) {
      return LockFileSchema.parse({});
    }
    try {
      const content = readFileSync(this.lockFilePath, "utf-8");
      return LockFileSchema.parse(YAML.parse(content));
    } catch (error) {
      if (process.env.DEV_MODE === "true") {
        console.error("Error reading lock file:", error);
      }
      return LockFileSchema.parse({});
    }
  }

  private saveLockFile(): void {
    const content = YAML.stringify(this.lockFile);
    writeFileSync(this.lockFilePath, content);
  }
}
