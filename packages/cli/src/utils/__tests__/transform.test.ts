import {
  afterAll,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";
import fs from "node:fs";
import path from "node:path";
import {
  type ExtractedStrings,
  applyTranslations,
  extractStringsFromJSX,
  processDirectory,
} from "../transform.js";

// Create a file cache for our mocked file system
const fileCache: { [key: string]: string } = {};

// Mock fs and path with proper types
const mockReadFileSync = mock((filepath: string, encoding?: string) => {
  if (encoding === "utf8" && fileCache[filepath]) {
    return fileCache[filepath];
  }
  throw new Error(`ENOENT: no such file or directory, open '${filepath}'`);
});

const mockWriteFileSync = mock(
  (filepath: string, data: string, encoding?: string) => {
    if (encoding === "utf8") {
      fileCache[filepath] = data;
    }
  },
);

const mockBasename = mock((filepath: string, ext?: string) => {
  const parts = filepath.split("/");
  const filename = parts[parts.length - 1];
  return ext ? filename.replace(ext, "") : filename;
});

const mockExtname = mock((filepath: string) => {
  const parts = filepath.split(".");
  return parts.length > 1 ? `.${parts.pop()}` : "";
});

// Store original functions
const originalReadFileSync = fs.readFileSync;
const originalWriteFileSync = fs.writeFileSync;
const originalBasename = path.basename;
const originalExtname = path.extname;

// Mock fast-glob
const mockFastGlob = {
  default: mock(async () => [] as string[]),
};

mock.module("fast-glob", () => mockFastGlob);

describe("transform utils", () => {
  beforeEach(() => {
    // Setup mocks
    Object.assign(fs, {
      readFileSync: mockReadFileSync,
      writeFileSync: mockWriteFileSync,
    });
    Object.assign(path, {
      basename: mockBasename,
      extname: mockExtname,
    });

    // Clear mock data
    mockReadFileSync.mockClear();
    mockWriteFileSync.mockClear();
    mockBasename.mockClear();
    mockExtname.mockClear();

    // Clear the file cache
    for (const key in fileCache) {
      delete fileCache[key];
    }
  });

  afterAll(() => {
    // Restore original functions
    Object.assign(fs, {
      readFileSync: originalReadFileSync,
      writeFileSync: originalWriteFileSync,
    });
    Object.assign(path, {
      basename: originalBasename,
      extname: originalExtname,
    });
  });

  describe("extractStringsFromJSX", () => {
    const mockJSXContent = `
      function Header() {
        return (
          <div>
            <h1>Welcome to our site</h1>
            <p>This is a description</p>
          </div>
        );
      }

      export const Hero = () => {
        return (
          <section>
            <h2>Hero Section</h2>
            <button>Click me</button>
            <img alt="Hero image" src="/hero.png" />
            <input placeholder="Enter your email" />
            <div aria-label="Navigation menu" />
          </section>
        );
      }
    `;

    beforeEach(() => {
      mockReadFileSync.mockReturnValue(mockJSXContent);
    });

    test("should extract text from JSX components and attributes", () => {
      const result = extractStringsFromJSX("test.tsx");

      expect(mockReadFileSync).toHaveBeenCalledWith("test.tsx", "utf8");
      expect(result).toMatchObject({
        header: {
          h1: {
            text: "Welcome to our site",
            filepath: "test.tsx",
            location: expect.any(Object),
          },
          p: {
            text: "This is a description",
            filepath: "test.tsx",
            location: expect.any(Object),
          },
        },
        hero: {
          h2: {
            text: "Hero Section",
            filepath: "test.tsx",
            location: expect.any(Object),
          },
          button: {
            text: "Click me",
            filepath: "test.tsx",
            location: expect.any(Object),
          },
          img_alt: {
            text: "Hero image",
            filepath: "test.tsx",
            location: expect.any(Object),
          },
          input_placeholder: {
            text: "Enter your email",
            filepath: "test.tsx",
            location: expect.any(Object),
          },
          div_aria_label: {
            text: "Navigation menu",
            filepath: "test.tsx",
            location: expect.any(Object),
          },
        },
      });
    });

    test("should handle empty or whitespace-only text nodes", () => {
      const mockEmptyContent = `
        function Empty() {
          return (
            <div>
              {" "}
              <img alt="" />
            </div>
          );
        }
      `;
      mockReadFileSync.mockReturnValue(mockEmptyContent);

      const result = extractStringsFromJSX("empty.tsx");
      expect(mockReadFileSync).toHaveBeenCalledWith("empty.tsx", "utf8");
      expect(result).toEqual({});
    });
  });

  describe("processDirectory", () => {
    test("should process multiple files in a directory", async () => {
      const mockFiles = ["/path/to/component1.tsx", "/path/to/component2.tsx"];
      mockFastGlob.default.mockImplementation(() => Promise.resolve(mockFiles));

      const mockContent1 = `
        function Component1() {
          return <h1>Hello World</h1>;
        }
      `;

      const mockContent2 = `
        function Component2() {
          return <img alt="Test Content" src="" />;
        }
      `;

      mockReadFileSync
        .mockReturnValueOnce(mockContent1)
        .mockReturnValueOnce(mockContent2);

      const result = await processDirectory("/path/to");

      expect(result).toMatchObject({
        component1: {
          h1: {
            text: "Hello World",
            filepath: expect.any(String),
            location: expect.any(Object),
          },
        },
        component2: {
          img_alt: {
            text: "Test Content",
            filepath: expect.any(String),
            location: expect.any(Object),
          },
        },
      });
    });
  });

  describe("applyTranslations", () => {
    const mockExtractedStrings: ExtractedStrings = {
      header: {
        title: {
          text: "Welcome",
          filepath: "/path/to/header.tsx",
          location: { start: 10, end: 17 },
        },
        img_alt: {
          text: "Header image",
          filepath: "/path/to/header.tsx",
          location: { start: 50, end: 61 },
        },
      },
    };

    const mockFileContent = `
      function Header() {
        return (
          <div>
            <h1>Welcome</h1>
            <img alt="Header image" src="" />
          </div>
        );
      }
    `;

    beforeEach(() => {
      mockReadFileSync.mockReturnValue(mockFileContent);
    });

    test("should replace strings with translation keys", async () => {
      await applyTranslations(mockExtractedStrings);

      const result = fileCache["/path/to/header.tsx"];
      expect(result).toContain("{t('header.title')}");
      expect(result).toContain("{t('header.img_alt')}");
    });
  });
});
