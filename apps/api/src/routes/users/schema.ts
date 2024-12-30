import z from "zod";
import "zod-openapi/extend";

export const userResponseSchema = z
  .object({
    data: z
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
      .nullable()
      .openapi({ description: "User profile information" }),
    error: z.string().optional().openapi({
      example: "Failed to get user profile",
      description: "Error message if request failed",
    }),
  })
  .openapi({ ref: "UserResponse" });

export const updateUserBodySchema = z
  .object({
    name: z.string().min(1).optional().openapi({
      example: "John Doe",
      description: "New name to update user profile with",
    }),
    email: z.string().email().optional().openapi({
      example: "user@example.com",
      description: "New email to update user profile with",
    }),
  })
  .refine((data) => data.name || data.email, {
    message: "At least one field must be provided",
  })
  .openapi({ ref: "UpdateUserBody" });
