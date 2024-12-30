import z from "zod";
import "zod-openapi/extend";

export const teamResponseSchema = z
  .object({
    data: z
      .object({
        id: z.string().openapi({
          example: "team_123",
          description: "Unique identifier for the team",
        }),
        name: z.string().openapi({
          example: "My Team",
          description: "Name of the team",
        }),
        members: z
          .array(
            z.object({
              email: z.string().email().openapi({
                example: "user@example.com",
                description: "Email address of team member",
              }),
              role: z.enum(["owner", "member", "pending"]).openapi({
                example: "member",
                description: "Role of the team member",
              }),
            }),
          )
          .openapi({
            description: "List of team members",
          }),
      })
      .nullable()
      .openapi({ description: "Team information" }),
    error: z.string().optional().openapi({
      example: "Team not found",
      description: "Error message if request failed",
    }),
  })
  .openapi({ ref: "TeamResponse" });

export const createTeamSchema = z
  .object({
    name: z.string().min(1).openapi({
      example: "My Team",
      description: "Name for the new team",
    }),
  })
  .openapi({ ref: "CreateTeam" });

export const inviteSchema = z
  .object({
    email: z.string().email().openapi({
      example: "user@example.com",
      description: "Email address of user to invite",
    }),
  })
  .openapi({ ref: "InviteUser" });
