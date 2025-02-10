import { describe, expect, test } from "bun:test";
import { FTLParser } from "../formats/ftl.js";

describe("FTLParser", () => {
  const parser = new FTLParser({ type: "ftl" });

  test("parses simple key-value pairs", async () => {
    const input = `
menu-save = Save
help-menu-save = Click Save to save the file.
    `;

    const result = await parser.parse(input);
    expect(result).toEqual({
      "menu-save": "Save",
      "help-menu-save": "Click Save to save the file.",
    });
  });

  test("parses multiline values", async () => {
    const input = `
multi = Text can also span multiple lines as long as
    each new line is indented by at least one space.
    Because all lines in this message are indented
    by the same amount.

block =
    Sometimes it's more readable to format
    multiline text as a "block", which means
    starting it on a new line.
    `;

    const result = await parser.parse(input);
    expect(result).toEqual({
      multi:
        "Text can also span multiple lines as long as each new line is indented by at least one space. Because all lines in this message are indented by the same amount.",
      block:
        'Sometimes it\'s more readable to format multiline text as a "block", which means starting it on a new line.',
    });
  });

  test("ignores comments and empty lines", async () => {
    const input = `
# This is a comment
menu-save = Save

# Another comment
help-menu-save = Click Save to save the file.
    `;

    const result = await parser.parse(input);
    expect(result).toEqual({
      "menu-save": "Save",
      "help-menu-save": "Click Save to save the file.",
    });
  });

  test("serializes simple key-value pairs", async () => {
    const input = {
      "menu-save": "Save",
      "help-menu-save": "Click Save to save the file.",
    };

    const result = await parser.serialize("en", input);
    expect(result).toBe(
      "menu-save = Save\nhelp-menu-save = Click Save to save the file.",
    );
  });

  test("serializes multiline values", async () => {
    const input = {
      multi:
        "Text can also span multiple lines as long as each new line is indented by at least one space.",
      block:
        'Sometimes it\'s more readable to format\nmultiline text as a "block".',
    };

    const result = await parser.serialize("en", input);
    expect(result).toBe(
      "multi = Text can also span multiple lines as long as each new line is indented by at least one space.\n" +
        "block =\n" +
        "    Sometimes it's more readable to format\n" +
        '    multiline text as a "block".',
    );
  });
});
