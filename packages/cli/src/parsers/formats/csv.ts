import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { BaseParser, type ParserOptions } from "../core/base-parser.js";

interface CsvRow extends Record<string, string> {
  id: string;
  value: string;
}

export interface CsvMetadata {
  columns?: string[];
  columnData?: Record<string, Record<string, string>>;
}

export class CsvParser extends BaseParser {
  private metadata: CsvMetadata = {
    columns: ["id", "value"],
    columnData: {},
  };

  async parse(input: string): Promise<Record<string, string>> {
    try {
      const parsed = parse(input, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Array<CsvRow>;

      if (!parsed.length || !("id" in parsed[0] && "value" in parsed[0])) {
        throw new Error('CSV must have "id" and "value" columns');
      }

      // Update metadata with parsed columns
      this.metadata.columns = Array.from(
        new Set([...this.metadata.columns!, ...Object.keys(parsed[0])]),
      );

      // Process rows and build result
      const result: Record<string, string> = {};
      const newColumnData: Record<string, Record<string, string>> = {};

      for (const row of parsed) {
        const { id: key, value } = row;
        if (!key || !value) continue;

        result[key] = value;

        // Store additional column data
        const additionalData = Object.fromEntries(
          this.metadata.columns
            .filter((col) => col !== "id" && col !== "value" && row[col])
            .map((col) => [col, row[col]]),
        );

        if (Object.keys(additionalData).length) {
          newColumnData[key] = {
            ...this.metadata.columnData?.[key],
            ...additionalData,
          };
        }
      }

      this.metadata.columnData = newColumnData;
      return result;
    } catch (error) {
      throw new Error(
        `Failed to parse CSV translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      const usedColumns = Array.from(
        new Set([
          "id",
          "value",
          ...(this.metadata.columns?.filter(
            (col) => col !== "id" && col !== "value",
          ) || []),
        ]),
      );

      const rows: Record<string, string>[] = [];
      const processedKeys = new Set<string>();

      // Process existing rows first to maintain order
      if (originalData) {
        for (const [key, originalValue] of Object.entries(originalData)) {
          processedKeys.add(key);
          rows.push({
            id: key,
            value: data[key] ?? originalValue,
            ...Object.fromEntries(
              usedColumns
                .filter((col) => col !== "id" && col !== "value")
                .map((col) => [
                  col,
                  this.metadata.columnData?.[key]?.[col] || "",
                ]),
            ),
          });
        }
      }

      // Add new rows
      for (const [key, value] of Object.entries(data)) {
        if (processedKeys.has(key)) continue;

        rows.push({
          id: key,
          value,
          ...Object.fromEntries(
            usedColumns
              .filter((col) => col !== "id" && col !== "value")
              .map((col) => [
                col,
                this.metadata.columnData?.[key]?.[col] || "",
              ]),
          ),
        });
      }

      return stringify(rows, {
        header: true,
        columns: usedColumns,
      });
    } catch (error) {
      throw new Error(
        `Failed to serialize CSV translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export function createCsvParser(options: ParserOptions): CsvParser {
  return new CsvParser(options);
}
