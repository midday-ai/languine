import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { mkdir, writeFile } from "node:fs/promises";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { getDiff } from "../utils/diff.js";
import { LockFileManager } from "../utils/lock.js";

describe("diff detection tests", () => {
  const testDir = join(process.cwd(), "test-diff-files");
  let lockManager: LockFileManager;

  // Set up test environment
  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
  });

  beforeEach(() => {
    lockManager = new LockFileManager(testDir);
    lockManager.clearLockFile();
  });

  // Clean up test files
  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should detect all keys as additions for new files", async () => {
    const filePath = join(testDir, "en.json");
    const content = {
      hello: "Hello",
      welcome: "Welcome",
    };

    await writeFile(filePath, JSON.stringify(content, null, 2));

    const changes = await getDiff({
      sourceFilePath: filePath,
      type: "json",
      workingDir: testDir,
    });

    expect(changes.addedKeys.sort()).toEqual(["hello", "welcome"].sort());
    expect(changes.removedKeys).toEqual([]);
    expect(changes.changedKeys).toEqual([]);
    expect(changes.valueChanges.map((v) => v.key).sort()).toEqual(
      ["hello", "welcome"].sort(),
    );
    expect(changes.valueChanges.find((v) => v.key === "hello")?.newValue).toBe(
      "Hello",
    );
    expect(
      changes.valueChanges.find((v) => v.key === "welcome")?.newValue,
    ).toBe("Welcome");
  });

  test("should detect value changes in tracked files", async () => {
    const filePath = join(testDir, "tracked.json");

    // Create and register initial file
    const initialContent = {
      greeting: "Hello world",
      farewell: "Goodbye",
    };
    await writeFile(filePath, JSON.stringify(initialContent, null, 2));
    lockManager.registerSourceData(filePath, initialContent);

    // Modify the file
    const updatedContent = {
      greeting: "Hello there", // Changed value
      farewell: "Goodbye", // Unchanged value
      welcome: "Welcome", // New key
    };
    await writeFile(filePath, JSON.stringify(updatedContent, null, 2));

    const changes = await getDiff({
      sourceFilePath: filePath,
      type: "json",
      workingDir: testDir,
    });

    expect(changes.addedKeys).toEqual(["welcome"]);
    expect(changes.removedKeys).toEqual([]);
    expect(changes.changedKeys).toEqual(["greeting"]);
    expect(changes.valueChanges.length).toBe(2);
    expect(
      changes.valueChanges.find((v) => v.key === "greeting")?.newValue,
    ).toBe("Hello there");
    expect(
      changes.valueChanges.find((v) => v.key === "welcome")?.newValue,
    ).toBe("Welcome");
  });

  test("should detect removed keys in tracked files", async () => {
    const filePath = join(testDir, "with-removals.json");

    // Create and register initial file
    const initialContent = {
      title: "Title",
      subtitle: "Subtitle",
      description: "Description",
    };
    await writeFile(filePath, JSON.stringify(initialContent, null, 2));
    lockManager.registerSourceData(filePath, initialContent);

    // Remove some keys and modify others
    const updatedContent = {
      title: "New Title", // Changed value
      description: "Description", // Unchanged value
      // subtitle removed
    };
    await writeFile(filePath, JSON.stringify(updatedContent, null, 2));

    const changes = await getDiff({
      sourceFilePath: filePath,
      type: "json",
      workingDir: testDir,
    });

    expect(changes.addedKeys).toEqual([]);
    expect(changes.removedKeys).toEqual(["subtitle"]);
    expect(changes.changedKeys).toEqual(["title"]);
    expect(changes.valueChanges.length).toBe(1);
    expect(changes.valueChanges[0].key).toBe("title");
    expect(changes.valueChanges[0].newValue).toBe("New Title");
  });
});
