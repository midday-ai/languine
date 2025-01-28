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
import { localeCommand } from "../commands/locale.js";
import type { Config } from "../types.js";
import { configFile, loadConfig } from "../utils/config.js";

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

describe("locale command tests", () => {
  const testDir = join(process.cwd(), "test-locale-files");
  const configPath = join(testDir, "languine.config.json");
  let initialConfig: Config;

  // Set up test environment
  beforeAll(async () => {
    // Create test directory
    await mkdir(testDir, { recursive: true });
  });

  // Set up fresh config before each test
  beforeEach(async () => {
    // Create initial config file
    initialConfig = {
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

    await writeFile(configPath, JSON.stringify(initialConfig, null, 2));

    // Mock config functions
    mock.module("../utils/config.js", () => ({
      loadConfig: () => Promise.resolve({ ...initialConfig }),
      configFile: () => Promise.resolve({ path: configPath }),
    }));
  });

  // Clean up test files
  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should add new locales", async () => {
    // Run locale command to add new locales
    process.chdir(testDir);
    await localeCommand(["add", "de,it"]);

    // Read the actual updated file
    const updatedConfig = JSON.parse(await readFile(configPath, "utf-8"));
    expect(updatedConfig.locale.targets).toEqual(["es", "fr", "de", "it"]);
  });

  test("should remove existing locales", async () => {
    // Run locale command to remove locales
    process.chdir(testDir);
    await localeCommand(["remove", "fr"]);

    // Read the actual updated file
    const updatedConfig = JSON.parse(await readFile(configPath, "utf-8"));
    expect(updatedConfig.locale.targets).toEqual(["es"]);
  });

  test("should handle adding duplicate locales", async () => {
    // Run locale command to add existing locale
    process.chdir(testDir);
    await localeCommand(["add", "es"]);

    // Read the actual updated file
    const updatedConfig = JSON.parse(await readFile(configPath, "utf-8"));
    expect(updatedConfig.locale.targets).toEqual(["es", "fr"]);
  });

  test("should handle removing non-existent locales", async () => {
    // Run locale command to remove non-existent locale
    process.chdir(testDir);
    await localeCommand(["remove", "de"]);

    // Read the actual updated file
    const updatedConfig = JSON.parse(await readFile(configPath, "utf-8"));
    expect(updatedConfig.locale.targets).toEqual(["es", "fr"]);
  });

  test("should handle multiple operations", async () => {
    // Add multiple locales
    process.chdir(testDir);
    await localeCommand(["add", "de,it,ja"]);
    let config = JSON.parse(await readFile(configPath, "utf-8"));
    expect(config.locale.targets).toEqual(["es", "fr", "de", "it", "ja"]);

    // Reset mock to use updated config
    mock.module("../utils/config.js", () => ({
      loadConfig: () => Promise.resolve(config),
      configFile: () => Promise.resolve({ path: configPath }),
    }));

    // Remove multiple locales
    await localeCommand(["remove", "fr,it"]);
    config = JSON.parse(await readFile(configPath, "utf-8"));
    expect(config.locale.targets).toEqual(["es", "de", "ja"]);
  });

  test("should validate locale command argument", async () => {
    // Try invalid command
    await expect(localeCommand(["invalid", "de"])).rejects.toThrow();
  });

  test("should require at least one locale", async () => {
    // Try empty locale list
    await expect(localeCommand(["add", ""])).rejects.toThrow();
    await expect(localeCommand(["remove", ""])).rejects.toThrow();
  });
});
