import { db } from "@/db";
import { members, organizations, projects, users } from "@/db/schema";
import { Hono } from "@/lib/app";
import { eq } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { createTeamSchema, inviteSchema, teamResponseSchema } from "./schema";

const app = new Hono();

app.get(
  "/",
  describeRoute({
    description: "Get teams for current user",
    responses: {
      200: {
        description: "Successfully retrieved teams",
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
  async (c) => {
    const user = c.get("user");

    try {
      const database = db(c.env.DB);

      const teams = await database
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          logo: organizations.logo,
          role: members.role,
          apiKey: organizations.apiKey,
          plan: organizations.plan,
        })
        .from(members)
        .innerJoin(organizations, eq(organizations.id, members.organizationId))
        .innerJoin(users, eq(users.id, members.userId))
        .where(eq(users.id, user?.id))
        .all();

      return c.json({
        data: teams.map((team) => ({
          id: team.id,
          name: team.name,
          slug: team.slug,
          logo: team.logo,
          role: team.role,
          apiKey: team.apiKey,
          plan: team.plan,
        })),
      });
    } catch (error) {
      return c.json({ error: "Failed to retrieve teams" }, 500);
    }
  },
);

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

app
  .get(
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
  )
  .get(
    "/:teamId/projects",
    describeRoute({
      description: "Get projects for a team",
      responses: {
        200: {
          description: "Successfully retrieved team projects",
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
      const user = c.get("user");
      const teamId = c.req.param("teamId");

      try {
        const database = db(c.env.DB);

        // First check if user has access to this team
        const teamMember = await database
          .select({
            role: members.role,
          })
          .from(members)
          .where(
            eq(members.userId, user?.id) && eq(members.organizationId, teamId),
          )
          .get();

        if (!teamMember) {
          return c.json({ error: "You don't have access to this team" }, 403);
        }

        const teamProjects = await database
          .select({
            id: projects.id,
            name: projects.name,
            slug: projects.slug,
            description: projects.description,
            createdAt: projects.createdAt,
            updatedAt: projects.updatedAt,
          })
          .from(projects)
          .where(eq(projects.organizationId, teamId))
          .all();

        return c.json({
          data: teamProjects,
        });
      } catch (error) {
        return c.json({ error: "Failed to retrieve team projects" }, 500);
      }
    },
  );

export default app;
