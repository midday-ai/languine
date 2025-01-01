import { Hono } from "@/lib/app";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { updateUserBodySchema, userResponseSchema } from "./schema";

const app = new Hono();

app.get(
  "/me",
  describeRoute({
    description: "Get current user profile",
    responses: {
      200: {
        description: "Successfully retrieved user profile",
        content: {
          "application/json": {
            schema: resolver(userResponseSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: resolver(userResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const session = c.get("session");
    const user = c.get("user");

    if (!user) return c.body(null, 401);

    return c.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        activeOrganizationId: session.activeOrganizationId,
      },
    });
  },
);

app.patch(
  "/me",
  describeRoute({
    description: "Update current user profile",
    responses: {
      200: {
        description: "Successfully updated user profile",
        content: {
          "application/json": {
            schema: resolver(userResponseSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: resolver(userResponseSchema),
          },
        },
      },
    },
  }),
  zValidator("json", updateUserBodySchema),
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      const body = await c.req.valid("json");
      // TODO: Implement user profile update logic
      return c.json({
        data: {
          email: body.email,
          name: body.name,
          provider: "github",
        },
      });
    } catch (error) {
      return c.json({ error: "Failed to update user profile" }, 401);
    }
  },
);

app.delete(
  "/me",
  describeRoute({
    description: "Delete current user account",
    responses: {
      200: {
        description: "Successfully deleted user account",
        content: {
          "application/json": {
            schema: resolver(userResponseSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: resolver(userResponseSchema),
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
      // TODO: Implement user account deletion logic
      return c.json({
        data: {
          email: "",
          name: "",
          provider: "github",
        },
      });
    } catch (error) {
      return c.json({ error: "Failed to delete user account" }, 401);
    }
  },
);

export default app;
