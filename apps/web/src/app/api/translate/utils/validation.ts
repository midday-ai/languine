import { z } from "zod";

// Supported formats from the codebase
export const FORMAT_ENUM = [
  "string",
  "json",
  "yaml",
  "properties",
  "android",
  "xcode-strings",
  "xcode-stringsdict",
  "xcode-xcstrings",
  "md",
  "mdx",
  "html",
  "js",
  "ts",
  "po",
  "xliff",
  "csv",
  "xml",
  "arb",
] as const;

export const translateRequestSchema = z.object({
  projectId: z.string(),
  sourceLocale: z.string(),
  targetLocale: z.string(),
  format: z.enum(FORMAT_ENUM).optional().default("string"),
  sourceText: z.string(),
  cache: z.boolean().optional().default(true),
});

export type TranslateRequest = z.infer<typeof translateRequestSchema>;

export const getValidationErrorMessage = (error: z.ZodError): string => {
  const errors = error.errors.map((err) => {
    const field = err.path.join(".");
    switch (err.code) {
      case "invalid_type":
        return `${field} must be a ${err.expected}`;
      case "invalid_enum_value":
        return `${field} must be one of: ${err.options?.join(", ")}`;
      case "invalid_string":
        return `${field} is not valid`;
      case "too_small":
        return `${field} is required`;
      default:
        return `${field} is invalid`;
    }
  });
  return errors[0] || "Invalid request format";
};
