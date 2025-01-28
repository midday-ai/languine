import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { simpleGit } from "simple-git";
import { syncCommand } from "../commands/sync.js";
import { client } from "../utils/api.js";
import { loadConfig } from "../utils/config.js";

// Mock the API client
const mockDeleteKeys = mock(() => Promise.resolve(true));

mock.module("../utils/api.js", () => ({
  client: {
    translate: {
      deleteKeys: {
        mutate: mockDeleteKeys,
      },
    },
  },
}));

// Mock interactive prompts
mock.module("@clack/prompts", () => ({
  confirm: () => Promise.resolve(true),
  note: () => {},
  outro: () => {},
  spinner: () => ({
    start: () => {},
    stop: () => {},
    message: () => {},
  }),
}));

describe("sync command tests", () => {
  const testDir = join(process.cwd(), "test-sync-files");
  let git: ReturnType<typeof simpleGit>;

  // Set up test environment
  beforeAll(async () => {
    // Create test directory
    await mkdir(testDir, { recursive: true });

    // Create config file
    const config = {
      projectId: "test-project",
      locale: {
        source: "en",
        targets: ["es", "fr"],
      },
      files: {
        json: {
          include: ["locales/[locale].json"],
        },
      },
    };

    await writeFile(
      join(testDir, "languine.config.json"),
      JSON.stringify(config, null, 2),
    );

    // Mock loadConfig to use our test config
    mock.module("../utils/config.js", () => ({
      loadConfig: () => Promise.resolve(config),
    }));
  });

  // Initialize a fresh git repo before each test
  beforeEach(async () => {
    // Remove any existing git directory and recreate test structure
    await rm(join(testDir, ".git"), { recursive: true, force: true });
    await mkdir(join(testDir, "locales"), { recursive: true });

    // Initialize fresh git repo
    git = simpleGit(testDir);
    await git.init();
    await git.addConfig("user.name", "Test User");
    await git.addConfig("user.email", "test@example.com");

    // Create initial commit to establish HEAD
    await writeFile(join(testDir, ".gitkeep"), "");
    await git.add(".gitkeep");
    await git.commit("Initial commit");

    // Set up initial translation files
    const sourceContent = {
      hello: "Hello",
      welcome: "Welcome",
      goodbye: "Goodbye",
    };
    const esContent = {
      hello: "Hola",
      welcome: "Bienvenido",
      goodbye: "Adiós",
    };
    const frContent = {
      hello: "Bonjour",
      welcome: "Bienvenue",
      goodbye: "Au revoir",
    };

    // Write and commit all files
    await writeFile(
      join(testDir, "locales", "en.json"),
      JSON.stringify(sourceContent, null, 2),
    );
    await writeFile(
      join(testDir, "locales", "es.json"),
      JSON.stringify(esContent, null, 2),
    );
    await writeFile(
      join(testDir, "locales", "fr.json"),
      JSON.stringify(frContent, null, 2),
    );

    await git.add(".");
    await git.commit("Add translation files");
  });

  // Clean up test files
  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should detect and sync removed keys", async () => {
    // Remove a key from source file
    const updatedContent = {
      hello: "Hello",
      welcome: "Welcome",
      // goodbye removed
    };
    await writeFile(
      join(testDir, "locales", "en.json"),
      JSON.stringify(updatedContent, null, 2),
    );

    // Run sync command
    process.chdir(testDir);
    await syncCommand(["--silent"]);

    // Verify API was called to delete keys
    expect(mockDeleteKeys).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "test-project",
        keys: ["goodbye"],
      }),
    );

    // Verify keys were removed from target files
    const esContent = JSON.parse(
      await readFile(join(testDir, "locales", "es.json"), "utf-8"),
    );
    const frContent = JSON.parse(
      await readFile(join(testDir, "locales", "fr.json"), "utf-8"),
    );

    expect(esContent).not.toHaveProperty("goodbye");
    expect(frContent).not.toHaveProperty("goodbye");
    expect(esContent).toEqual({
      hello: "Hola",
      welcome: "Bienvenido",
    });
    expect(frContent).toEqual({
      hello: "Bonjour",
      welcome: "Bienvenue",
    });
  });

  test("should handle check mode without making changes", async () => {
    // Remove a key from source file
    const updatedContent = {
      hello: "Hello",
      welcome: "Welcome",
      // goodbye removed
    };
    await writeFile(
      join(testDir, "locales", "en.json"),
      JSON.stringify(updatedContent, null, 2),
    );

    // Run sync command in check mode
    process.chdir(testDir);
    let exitCode = 0;
    try {
      await syncCommand(["--check", "--silent"]);
    } catch (error) {
      exitCode = 1;
    }

    // Verify check mode detected changes
    expect(exitCode).toBe(1);

    // Verify no API calls were made
    expect(mockDeleteKeys).not.toHaveBeenCalled();

    // Verify target files were not modified
    const esContent = JSON.parse(
      await readFile(join(testDir, "locales", "es.json"), "utf-8"),
    );
    const frContent = JSON.parse(
      await readFile(join(testDir, "locales", "fr.json"), "utf-8"),
    );

    expect(esContent).toHaveProperty("goodbye");
    expect(frContent).toHaveProperty("goodbye");
  });

  test("should handle multiple removed keys", async () => {
    // Remove multiple keys from source file
    const updatedContent = {
      hello: "Hello",
      // welcome and goodbye removed
    };
    await writeFile(
      join(testDir, "locales", "en.json"),
      JSON.stringify(updatedContent, null, 2),
    );

    // Run sync command
    process.chdir(testDir);
    await syncCommand(["--silent"]);

    // Verify API was called with all removed keys
    expect(mockDeleteKeys).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "test-project",
        keys: expect.arrayContaining(["welcome", "goodbye"]),
      }),
    );

    // Verify all keys were removed from target files
    const esContent = JSON.parse(
      await readFile(join(testDir, "locales", "es.json"), "utf-8"),
    );
    const frContent = JSON.parse(
      await readFile(join(testDir, "locales", "fr.json"), "utf-8"),
    );

    expect(esContent).toEqual({
      hello: "Hola",
    });
    expect(frContent).toEqual({
      hello: "Bonjour",
    });
  });

  test("should handle declined confirmation", async () => {
    // Mock confirm to return false
    mock.module("@clack/prompts", () => ({
      confirm: () => Promise.resolve(false),
      note: () => {},
      outro: () => {},
      spinner: () => ({
        start: () => {},
        stop: () => {},
        message: () => {},
      }),
    }));

    // Remove a key from source file
    const updatedContent = {
      hello: "Hello",
      // welcome and goodbye removed
    };
    await writeFile(
      join(testDir, "locales", "en.json"),
      JSON.stringify(updatedContent, null, 2),
    );

    // Run sync command
    process.chdir(testDir);
    await syncCommand(["--silent"]);

    // Verify no API calls were made
    expect(mockDeleteKeys).not.toHaveBeenCalled();

    // Verify files were not modified
    const esContent = JSON.parse(
      await readFile(join(testDir, "locales", "es.json"), "utf-8"),
    );
    expect(esContent).toHaveProperty("welcome");
    expect(esContent).toHaveProperty("goodbye");
  });
});
