import z from "zod";
import "zod-openapi/extend";

export const bodySchema = z
  .object({
    source: z
      .string()
      .openapi({ example: "en", description: "Source language code" }),
    target: z
      .string()
      .openapi({ example: "es", description: "Target language code" }),
    input: z
      .string()
      .openapi({ example: "Hello world", description: "Original text" }),
    translation: z
      .string()
      .openapi({ example: "Hola mundo", description: "Machine translation" }),
    suggestion: z
      .string()
      .optional()
      .openapi({ example: "¡Hola mundo!", description: "User suggestion" }),
    comment: z
      .string()
      .optional()
      .openapi({ example: "Too formal", description: "Additional comments" }),
  })
  .openapi({ ref: "Body" });

export const responseSchema = z
  .string()
  .openapi({ example: "Feedback received!" });
