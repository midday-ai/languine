import { Hono } from "@/lib/app";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { createTeamSchema, inviteSchema, teamResponseSchema } from "./schema";

const app = new Hono();

app.post(
  "/",
  describeRoute({
    description: "Create a new team",
    responses: {
      200: {
        description: "Successfully created team",
        content: {
          "application/json": {
            schema: resolver(teamResponseSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: resolver(teamResponseSchema),
          },
        },
      },
    },
  }),
  zValidator("json", createTeamSchema),
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      const body = await c.req.valid("json");
      // TODO: Implement team creation logic
      return c.json({
        data: {
          id: "team_123",
          name: body.name,
          members: [
            {
              email: "creator@example.com",
              role: "owner",
            },
          ],
        },
      });
    } catch (error) {
      return c.json({ error: "Failed to create team" }, 500);
    }
  },
);

app.get(
  "/:teamId",
  describeRoute({
    description: "Get team details",
    responses: {
      200: {
        description: "Successfully retrieved team details",
        content: {
          "application/json": {
            schema: resolver(teamResponseSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: resolver(teamResponseSchema),
          },
        },
      },
      404: {
        description: "Team not found",
        content: {
          "application/json": {
            schema: resolver(teamResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    const teamId = c.req.param("teamId");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      // TODO: Implement team retrieval logic
      return c.json({
        data: {
          id: teamId,
          name: "Example Team",
          members: [
            {
              email: "member1@example.com",
              role: "owner",
            },
            {
              email: "member2@example.com",
              role: "member",
            },
          ],
        },
      });
    } catch (error) {
      return c.json({ error: "Team not found" }, 404);
    }
  },
);

app.post(
  "/:teamId/invite",
  describeRoute({
    description: "Invite a user to the team",
    responses: {
      200: {
        description: "Successfully sent invitation",
        content: {
          "application/json": {
            schema: resolver(teamResponseSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing token",
        content: {
          "application/json": {
            schema: resolver(teamResponseSchema),
          },
        },
      },
      403: {
        description: "Forbidden - User doesn't have permission to invite",
        content: {
          "application/json": {
            schema: resolver(teamResponseSchema),
          },
        },
      },
    },
  }),
  zValidator("json", inviteSchema),
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    const teamId = c.req.param("teamId");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      const body = await c.req.valid("json");
      // TODO: Implement invite logic
      return c.json({
        data: {
          id: teamId,
          name: "Example Team",
          members: [
            {
              email: "existing@example.com",
              role: "owner",
            },
            {
              email: body.email,
              role: "pending",
            },
          ],
        },
      });
    } catch (error) {
      return c.json({ error: "Failed to send invitation" }, 500);
    }
  },
);

export default app;
