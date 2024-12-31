import { Hono } from "@/lib/app";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import {
  createProjectSchema,
  projectResponseSchema,
  updateProjectSchema,
} from "./schema";

const app = new Hono();

app.post(
  "/",
  describeRoute({
    description: "Create a new project",
    responses: {
      200: {
        description: "Successfully created project",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
    },
  }),
  zValidator("json", createProjectSchema),
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      const body = await c.req.valid("json");
      // TODO: Implement project creation logic
      return c.json({
        data: {
          id: "project_123",
          name: body.name,
          description: body.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      return c.json({ error: "Failed to create project" }, 500);
    }
  },
);

app.get(
  "/:id",
  describeRoute({
    description: "Get project by ID",
    responses: {
      200: {
        description: "Successfully retrieved project",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
      404: {
        description: "Project not found",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      const id = c.req.param("id");
      // TODO: Implement project retrieval logic
      return c.json({
        data: {
          id,
          name: "Sample Project",
          description: "A sample project description",
          sourceLanguage: "en",
          targetLanguages: ["es", "fr"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      return c.json({ error: "Project not found" }, 404);
    }
  },
);

app.patch(
  "/:id",
  describeRoute({
    description: "Update project",
    responses: {
      200: {
        description: "Successfully updated project",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
      404: {
        description: "Project not found",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
    },
  }),
  zValidator("json", updateProjectSchema),
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      const id = c.req.param("id");
      const body = await c.req.valid("json");
      // TODO: Implement project update logic
      return c.json({
        data: {
          id,
          name: body.name,
          description: body.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      return c.json({ error: "Project not found" }, 404);
    }
  },
);

app.delete(
  "/:id",
  describeRoute({
    description: "Delete project",
    responses: {
      200: {
        description: "Successfully deleted project",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
      404: {
        description: "Project not found",
        content: {
          "application/json": {
            schema: resolver(projectResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      const id = c.req.param("id");
      // TODO: Implement project deletion logic
      return c.json({
        data: null,
      });
    } catch (error) {
      return c.json({ error: "Project not found" }, 404);
    }
  },
);

export default app;
