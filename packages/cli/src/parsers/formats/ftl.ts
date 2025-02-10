import { BaseParser } from "../core/base-parser.js";

export class FTLParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    const messages: Record<string, string> = {};
    const lines = input.split("\n");
    let currentKey = "";
    let currentValue = "";
    let isMultiline = false;
    let multilineValues: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip comments and empty lines
      if (trimmedLine.startsWith("#") || trimmedLine === "") {
        continue;
      }

      // Handle multiline
      if (isMultiline) {
        if (line.startsWith(" ")) {
          multilineValues.push(trimmedLine);
          continue;
        }

        isMultiline = false;
        if (currentKey) {
          messages[currentKey] = multilineValues.join(" ");
        }
        currentKey = "";
        currentValue = "";
        multilineValues = [];
      }

      // Parse regular messages
      if (line.includes("=")) {
        const [key, ...valueParts] = line.split("=");
        currentKey = key.trim();
        currentValue = valueParts.join("=").trim();

        // Check if this is a multiline message
        if (currentValue === "") {
          isMultiline = true;
          multilineValues = [];
          continue;
        }

        if (currentValue.endsWith("\\")) {
          // Handle line continuation
          isMultiline = true;
          multilineValues = [currentValue.slice(0, -1).trim()];
          continue;
        }

        // Handle regular single line message
        if (currentValue.startsWith(" ")) {
          currentValue = currentValue.trim();
        }

        // If this is a multiline message starting on the same line
        if (i + 1 < lines.length && lines[i + 1].startsWith(" ")) {
          isMultiline = true;
          multilineValues = [currentValue];
          continue;
        }

        messages[currentKey] = currentValue;
      }
    }

    // Handle last multiline message if exists
    if (isMultiline && currentKey) {
      messages[currentKey] = multilineValues.join(" ");
    }

    return messages;
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
  ): Promise<string> {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      // Handle multiline values
      if (value.includes("\n")) {
        lines.push(`${key} =`);
        for (const line of value.split("\n")) {
          lines.push(`    ${line}`);
        }
      } else {
        lines.push(`${key} = ${value}`);
      }
    }

    return lines.join("\n");
  }
}
