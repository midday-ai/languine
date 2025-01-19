import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

interface CsvRow extends Record<string, string> {
  id: string;
  value: string;
}

export interface CsvMetadata {
  columns?: string[];
  columnData?: Record<string, Record<string, string>>;
}

export function createCsvParser(): Parser {
  const metadata: CsvMetadata = {
    columns: ["id", "value"],
    columnData: {},
  };

  return createFormatParser({
    async parse(input: string) {
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
        metadata.columns = Array.from(
          new Set([...metadata.columns!, ...Object.keys(parsed[0])]),
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
            metadata.columns
              .filter((col) => col !== "id" && col !== "value" && row[col])
              .map((col) => [col, row[col]]),
          );

          if (Object.keys(additionalData).length) {
            newColumnData[key] = {
              ...metadata.columnData?.[key],
              ...additionalData,
            };
          }
        }

        metadata.columnData = newColumnData;
        return result;
      } catch (error) {
        throw new Error(
          `Failed to parse CSV translations: ${(error as Error).message}`,
        );
      }
    },

    async serialize(_, data, originalData) {
      const usedColumns = Array.from(
        new Set([
          "id",
          "value",
          ...(metadata.columns?.filter(
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
                .map((col) => [col, metadata.columnData?.[key]?.[col] || ""]),
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
              .map((col) => [col, metadata.columnData?.[key]?.[col] || ""]),
          ),
        });
      }

      return stringify(rows, {
        header: true,
        columns: usedColumns,
      });
    },
  });
}
