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
import { simpleGit } from "simple-git";
import { getDiff } from "../utils/diff.js";

describe("diff detection tests", () => {
  const testDir = join(process.cwd(), "test-diff-files");
  let git: ReturnType<typeof simpleGit>;

  // Set up test environment
  beforeAll(async () => {
    // Create test directory first
    await mkdir(testDir, { recursive: true });
  });

  // Initialize a fresh git repo before each test
  beforeEach(async () => {
    // Remove any existing git directory
    await rm(join(testDir, ".git"), { recursive: true, force: true });

    // Initialize fresh git repo
    git = simpleGit(testDir);
    await git.init();
    await git.addConfig("user.name", "Test User");
    await git.addConfig("user.email", "test@example.com");

    // Create initial commit to establish HEAD
    await writeFile(join(testDir, ".gitkeep"), "");
    await git.add(".gitkeep");
    await git.commit("Initial commit");
  });

  // Clean up test files
  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should detect all keys as additions for untracked files", async () => {
    const filePath = join(testDir, "en.json");
    const content = {
      hello: "Hello",
      welcome: "Welcome",
    };

    await writeFile(filePath, JSON.stringify(content, null, 2));

    const changes = await getDiff({
      sourceFilePath: filePath,
      type: "json",
    });

    expect(changes.addedKeys).toEqual(["hello", "welcome"]);
    expect(changes.removedKeys).toEqual([]);
    expect(changes.changedKeys).toEqual([]);
    expect(changes.valueChanges).toEqual([
      { key: "hello", oldValue: "", newValue: "Hello" },
      { key: "welcome", oldValue: "", newValue: "Welcome" },
    ]);
  });

  test("should detect value changes in tracked files", async () => {
    const filePath = join(testDir, "tracked.json");

    // Create and commit initial file
    const initialContent = {
      greeting: "Hello world",
      farewell: "Goodbye",
    };
    await writeFile(filePath, JSON.stringify(initialContent, null, 2));
    await git.add(filePath);
    await git.commit("Add translation file");

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
    });

    expect(changes.addedKeys).toEqual(["welcome"]);
    expect(changes.removedKeys).toEqual([]);
    expect(changes.changedKeys).toEqual(["greeting"]);
    expect(changes.valueChanges).toEqual([
      { key: "greeting", oldValue: "Hello world", newValue: "Hello there" },
    ]);
  });

  test("should detect removed keys in tracked files", async () => {
    const filePath = join(testDir, "with-removals.json");

    // Create and commit initial file
    const initialContent = {
      title: "Title",
      subtitle: "Subtitle",
      description: "Description",
    };
    await writeFile(filePath, JSON.stringify(initialContent, null, 2));
    await git.add(filePath);
    await git.commit("Add translation file with all keys");

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
    });

    expect(changes.addedKeys).toEqual([]);
    expect(changes.removedKeys).toEqual(["subtitle"]);
    expect(changes.changedKeys).toEqual(["title"]);
    expect(changes.valueChanges).toEqual([
      { key: "title", oldValue: "Title", newValue: "New Title" },
    ]);
  });
});
