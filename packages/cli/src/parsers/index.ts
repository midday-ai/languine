import { z } from "zod";
import type { Parser, ParserOptions } from "./core/types.js";
import { AndroidParser } from "./formats/android.js";
import { ArbParser } from "./formats/arb.js";
import { CsvParser } from "./formats/csv.js";
import { HtmlParser } from "./formats/html.js";
import { JavaScriptParser } from "./formats/javascript.js";
import { JsonParser } from "./formats/json.js";
import { MarkdownParser } from "./formats/markdown.js";
import { PoParser } from "./formats/po.js";
import { PropertiesParser } from "./formats/properties.js";
import { XcodeStringsParser } from "./formats/xcode-strings.js";
import { XcodeStringsDictParser } from "./formats/xcode-stringsdict.js";
import { XcodeXcstringsParser } from "./formats/xcode-xcstrings.js";
import { XliffParser } from "./formats/xliff.js";
import { XmlParser } from "./formats/xml.js";
import { YamlParser } from "./formats/yaml.js";

export const parserTypeSchema = z.enum([
  "js",
  "ts",
  "json",
  "po",
  "yaml",
  "xml",
  "xliff",
  "xcode-strings",
  "xcode-stringsdict",
  "xcode-xcstrings",
  "properties",
  "android",
  "md",
  "mdx",
  "html",
  "csv",
  "arb",
]);

export type ParserType = z.infer<typeof parserTypeSchema>;

export function createParser(options: ParserOptions): Parser {
  switch (options.type) {
    case "js":
    case "ts":
      return new JavaScriptParser(options);
    case "json":
      return new JsonParser(options);
    case "po":
      return new PoParser(options);
    case "yaml":
      return new YamlParser(options);
    case "xml":
      return new XmlParser(options);
    case "xliff":
      return new XliffParser(options);
    case "xcode-strings":
      return new XcodeStringsParser(options);
    case "xcode-stringsdict":
      return new XcodeStringsDictParser(options);
    case "xcode-xcstrings":
      return new XcodeXcstringsParser(options);
    case "properties":
      return new PropertiesParser(options);
    case "android":
      return new AndroidParser(options);
    case "md":
    case "mdx":
      return new MarkdownParser(options);
    case "html":
      return new HtmlParser(options);
    case "csv":
      return new CsvParser(options);
    case "arb":
      return new ArbParser(options);
    default:
      throw new Error(`Unsupported parser type: ${options.type}`);
  }
}
