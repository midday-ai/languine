import z from "zod";
import "zod-openapi/extend";

export const bodySchema = z
  .object({
    name: z.string().optional().openapi({ example: "Steven" }),
  })
  .openapi({ ref: "Body" });

export const responseSchema = z.string().openapi({ example: "Hello Steven!" });
