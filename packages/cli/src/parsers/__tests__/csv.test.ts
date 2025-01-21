import { describe, expect, test } from "bun:test";
import { createParser } from "@/parsers/index.ts";

describe("CSV Parser", () => {
  test("parses CSV with id and value columns", async () => {
    const parser = createParser({ type: "csv" });
    const input = `id,value
greeting,Hello
farewell,Goodbye`;

    const result = await parser.parse(input);

    expect(result).toEqual({
      greeting: "Hello",
      farewell: "Goodbye",
    });
  });

  test("ignores rows without id or value", async () => {
    const parser = createParser({ type: "csv" });
    const input = `id,value
greeting,Hello
,Goodbye
invalid_row,
,`;

    const result = await parser.parse(input);

    expect(result).toEqual({
      greeting: "Hello",
    });
  });

  test("throws error on invalid CSV", async () => {
    const parser = createParser({ type: "csv" });
    const input = "invalid,csv,format";

    await expect(parser.parse(input)).rejects.toThrow(
      "Failed to parse CSV translations",
    );
  });

  test("serializes data to CSV format", async () => {
    const parser = createParser({ type: "csv" });
    const data = {
      greeting: "Hello",
      farewell: "Goodbye",
    };

    const result = await parser.serialize("en", data);

    expect(result).toEqual(`id,value
greeting,Hello
farewell,Goodbye
`);
  });

  test("preserves existing columns when serializing", async () => {
    const parser = createParser({ type: "csv" });
    // First parse a CSV with context data to initialize metadata
    const initialInput = `id,value,context
greeting,Hello,Welcome message
farewell,Goodbye,Exit message`;
    await parser.parse(initialInput);

    const data = {
      greeting: "Hola",
      farewell: "Adios",
      newKey: "New Value",
    };

    const result = await parser.serialize("en", data);

    expect(result).toEqual(`id,value,context
greeting,Hola,Welcome message
farewell,Adios,Exit message
newKey,New Value,
`);
  });

  test("handles empty input when serializing", async () => {
    const parser = createParser({ type: "csv" });
    const data = {
      greeting: "Hello",
    };

    const result = await parser.serialize("en", data);

    expect(result).toEqual(`id,value
greeting,Hello
`);
  });
});
