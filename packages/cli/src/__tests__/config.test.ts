import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, writeFile } from "node:fs/promises";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import glob from "fast-glob";

describe("config file pattern tests", () => {
  const testDir = join(process.cwd(), "test-files");
  const localesDir = join(testDir, "locales");

  // Set up test files
  beforeAll(async () => {
    await mkdir(localesDir, { recursive: true });
    await mkdir(join(localesDir, "en"), { recursive: true });
    await mkdir(join(localesDir, "es"), { recursive: true });

    // Create test files
    const files = [
      ["en/common.json", '{"hello": "Hello"}'],
      ["en/header.json", '{"title": "Title"}'],
      ["es/common.json", '{"hello": "Hola"}'],
      ["es/header.json", '{"title": "Título"}'],
      ["en.json", '{"root": "Root"}'],
      ["es.json", '{"root": "Raíz"}'],
    ];

    for (const [path, content] of files) {
      await writeFile(join(localesDir, path), content);
    }
  });

  // Clean up test files
  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should match nested json files with [locale]/*.json pattern", async () => {
    const pattern = join(localesDir, "[locale]/*.json").replace(/\\/g, "/");
    const sourcePattern = pattern.replace("[locale]", "en");
    const files = await glob(sourcePattern, { absolute: true });

    expect(files.length).toBe(2);
    expect(files.some((f) => f.endsWith("common.json"))).toBe(true);
    expect(files.some((f) => f.endsWith("header.json"))).toBe(true);
  });

  test("should match nested json files with [locale]/**.json pattern", async () => {
    const pattern = join(localesDir, "[locale]/**.json").replace(/\\/g, "/");
    const sourcePattern = pattern.replace("[locale]", "en");
    const files = await glob(sourcePattern, { absolute: true });

    expect(files.length).toBe(2);
    expect(files.some((f) => f.endsWith("common.json"))).toBe(true);
    expect(files.some((f) => f.endsWith("header.json"))).toBe(true);
  });

  test("should match root json files with [locale].json pattern", async () => {
    const pattern = join(localesDir, "[locale].json").replace(/\\/g, "/");
    const sourcePattern = pattern.replace("[locale]", "en");
    const files = await glob(sourcePattern, { absolute: true });

    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/en\.json$/);
  });
});
