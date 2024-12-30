import z from "zod";
import "zod-openapi/extend";

export const createProjectSchema = z
  .object({
    name: z.string().min(1).openapi({
      example: "My Translation Project",
      description: "Name of the project",
    }),
    description: z.string().optional().openapi({
      example: "A project for translating my website content",
      description: "Optional description of the project",
    }),
  })
  .openapi({ ref: "CreateProject" });

export const updateProjectSchema = z
  .object({
    name: z.string().min(1).optional().openapi({
      example: "Updated Project Name",
      description: "New name for the project",
    }),
    description: z.string().optional().openapi({
      example: "Updated project description",
      description: "New description for the project",
    }),
  })
  .refine((data) => data.name || data.description, {
    message: "At least one field must be provided",
  })
  .openapi({ ref: "UpdateProject" });

export const projectResponseSchema = z
  .object({
    data: z
      .object({
        id: z.string().openapi({
          example: "project_123",
          description: "Unique identifier for the project",
        }),
        name: z.string().openapi({
          example: "My Translation Project",
          description: "Name of the project",
        }),
        description: z.string().nullable().openapi({
          example: "A project for translating my website content",
          description: "Description of the project",
        }),
        createdAt: z.string().datetime().openapi({
          example: "2024-01-01T00:00:00Z",
          description: "Timestamp when the project was created",
        }),
        updatedAt: z.string().datetime().openapi({
          example: "2024-01-01T00:00:00Z",
          description: "Timestamp when the project was last updated",
        }),
      })
      .nullable()
      .openapi({ description: "Project information" }),
    error: z.string().optional().openapi({
      example: "Project not found",
      description: "Error message if request failed",
    }),
  })
  .openapi({ ref: "ProjectResponse" });
