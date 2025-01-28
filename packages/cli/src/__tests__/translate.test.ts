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
import { translateCommand } from "../commands/translate.js";
import { client } from "../utils/api.js";
import { loadConfig } from "../utils/config.js";
import { getAPIKey } from "../utils/session.js";

// Mock dependencies
mock.module("../utils/session.js", () => ({
  getAPIKey: () => "test-api-key",
}));

// Mock the API client
const mockStartJob = mock(() =>
  Promise.resolve({
    run: {
      id: "test-run-id",
      publicAccessToken: "test-token",
      output: {
        translations: {
          es: [
            { key: "hello", translatedText: "Hola" },
            { key: "welcome", translatedText: "Bienvenido" },
            { key: "goodbye", translatedText: "Adiós" },
          ],
          fr: [
            { key: "hello", translatedText: "Bonjour" },
            { key: "welcome", translatedText: "Bienvenue" },
            { key: "goodbye", translatedText: "Au revoir" },
          ],
        },
      },
    },
  }),
);

mock.module("../utils/api.js", () => ({
  client: {
    jobs: {
      startJob: {
        mutate: mockStartJob,
      },
    },
  },
}));

// Mock interactive prompts
mock.module("@clack/prompts", () => ({
  note: () => {},
  outro: () => {},
  spinner: () => ({
    start: () => {},
    stop: () => {},
    message: () => {},
  }),
}));

// Mock trigger.dev SDK
mock.module("@trigger.dev/sdk/v3", () => ({
  auth: {
    withAuth: async (
      config: { accessToken: string },
      callback: () => Promise<void>,
    ) => {
      await callback();
    },
  },
  runs: {
    subscribeToRun: async function* () {
      yield {
        metadata: { progress: 50 },
      };
      yield {
        metadata: { progress: 100 },
        finishedAt: new Date(),
        output: {
          translations: {
            es: [
              { key: "hello", translatedText: "Hola" },
              { key: "welcome", translatedText: "Bienvenido" },
              { key: "goodbye", translatedText: "Adiós" },
            ],
            fr: [
              { key: "hello", translatedText: "Bonjour" },
              { key: "welcome", translatedText: "Bienvenue" },
              { key: "goodbye", translatedText: "Au revoir" },
            ],
          },
        },
      };
    },
  },
}));

describe("translate command tests", () => {
  const testDir = join(process.cwd(), "test-translate-files");
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

    // Set up source file
    const sourceContent = {
      hello: "Hello",
      welcome: "Welcome",
    };
    const sourcePath = join(testDir, "locales", "en.json");
    await writeFile(sourcePath, JSON.stringify(sourceContent, null, 2));
    await git.add(sourcePath);
    await git.commit("Add source translations");

    // Reset mock call count
    mockStartJob.mockClear();
  });

  // Clean up test files
  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should translate new source file", async () => {
    // Update source file with new content
    const updatedContent = {
      hello: "Hello",
      welcome: "Welcome",
      goodbye: "Goodbye", // New key
    };
    await writeFile(
      join(testDir, "locales", "en.json"),
      JSON.stringify(updatedContent, null, 2),
    );

    // Run translate command
    process.chdir(testDir);
    await translateCommand(["--silent"]);

    // Verify API was called with correct parameters
    expect(mockStartJob).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "test-project",
        sourceLanguage: "en",
        targetLanguages: ["es", "fr"],
        content: expect.arrayContaining([
          expect.objectContaining({
            key: "goodbye",
            sourceText: "Goodbye",
          }),
        ]),
      }),
    );

    // Verify target files were created with translations
    const esContent = JSON.parse(
      await readFile(join(testDir, "locales", "es.json"), "utf-8"),
    );
    const frContent = JSON.parse(
      await readFile(join(testDir, "locales", "fr.json"), "utf-8"),
    );

    expect(esContent).toEqual({
      hello: "Hola",
      welcome: "Bienvenido",
      goodbye: "Adiós",
    });
    expect(frContent).toEqual({
      hello: "Bonjour",
      welcome: "Bienvenue",
      goodbye: "Au revoir",
    });
  });

  test("should handle force translate flag", async () => {
    // Run translate command with force flag
    process.chdir(testDir);
    await translateCommand(["--force", "--silent"]);

    // Verify API was called with all keys
    expect(mockStartJob).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.arrayContaining([
          expect.objectContaining({ key: "hello", sourceText: "Hello" }),
          expect.objectContaining({ key: "welcome", sourceText: "Welcome" }),
        ]),
      }),
    );
  });

  test("should handle specific locales with force flag", async () => {
    // Run translate command with force flag and specific locales
    process.chdir(testDir);
    await translateCommand(["--force", "es", "--silent"]);

    // Verify API was called with only specified locale
    expect(mockStartJob).toHaveBeenCalledWith(
      expect.objectContaining({
        targetLanguages: ["es"],
      }),
    );
  });

  test("should detect and translate changed values", async () => {
    // Update source file with changed values
    const updatedContent = {
      hello: "Hi there", // Changed value
      welcome: "Welcome", // Unchanged
    };
    await writeFile(
      join(testDir, "locales", "en.json"),
      JSON.stringify(updatedContent, null, 2),
    );

    // Run translate command
    process.chdir(testDir);
    await translateCommand(["--silent"]);

    // Verify API was called with only changed values
    expect(mockStartJob).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.arrayContaining([
          expect.objectContaining({
            key: "hello",
            sourceText: "Hi there",
          }),
        ]),
      }),
    );
    expect(mockStartJob).not.toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.arrayContaining([
          expect.objectContaining({
            key: "welcome",
            sourceText: "Welcome",
          }),
        ]),
      }),
    );
  });
});
