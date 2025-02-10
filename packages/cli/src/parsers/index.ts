import { z } from "zod";
import type { Parser, ParserOptions } from "./core/types.js";
import { AndroidParser } from "./formats/android.ts";
import { ArbParser } from "./formats/arb.ts";
import { CsvParser } from "./formats/csv.ts";
import { FTLParser } from "./formats/ftl.ts";
import { HtmlParser } from "./formats/html.ts";
import { JavaScriptParser } from "./formats/javascript.ts";
import { JsonParser } from "./formats/json.ts";
import { MarkdownParser } from "./formats/markdown.ts";
import { PoParser } from "./formats/po.ts";
import { PropertiesParser } from "./formats/properties.ts";
import { XcodeStringsParser } from "./formats/xcode-strings.ts";
import { XcodeStringsDictParser } from "./formats/xcode-stringsdict.ts";
import { XcodeXcstringsParser } from "./formats/xcode-xcstrings.ts";
import { XliffParser } from "./formats/xliff.ts";
import { XmlParser } from "./formats/xml.ts";
import { YamlParser } from "./formats/yaml.ts";

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
  "ftl",
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
    case "ftl":
      return new FTLParser(options);
    default:
      throw new Error(`Unsupported parser type: ${options.type}`);
  }
}
