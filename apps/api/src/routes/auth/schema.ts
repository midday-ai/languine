import z from "zod";
import "zod-openapi/extend";

export const authResponseSchema = z
  .object({
    data: z
      .object({
        token: z.string().openapi({
          example: "jwt_token",
          description: "JWT authentication token",
        }),
        user: z
          .object({
            email: z.string().email().openapi({
              example: "user@example.com",
              description: "User's email address",
            }),
            name: z.string().openapi({
              example: "John Doe",
              description: "User's full name",
            }),
            provider: z.enum(["github", "google"]).openapi({
              example: "github",
              description: "OAuth provider used for authentication",
            }),
          })
          .openapi({ description: "User profile information" }),
      })
      .optional()
      .openapi({ description: "Response data" }),
    error: z.string().optional().openapi({
      example: "Authentication failed",
      description: "Error message if request failed",
    }),
  })
  .openapi({ ref: "AuthResponse" });
