import { db } from "@/db";
import { members, organizations, projects } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { t } from "../init";

/**
 * Middleware to check if the authenticated user has access to the specified project.
 * Also allows access if the request is made with an organization's API key.
 */
export const hasProjectAccess = t.middleware(async ({ ctx, next, input }) => {
  // Ensure user is authenticated
  if (!ctx.authenticatedId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }

  const typedInput = input as { projectId: string };

  // Get project and its organization
  const result = await db
    .select({
      project: projects,
      organization: organizations,
      member: members,
    })
    .from(projects)
    .innerJoin(organizations, eq(organizations.id, projects.organizationId))
    .leftJoin(
      members,
      and(
        eq(members.organizationId, organizations.id),
        eq(members.userId, ctx.authenticatedId),
      ),
    )
    .where(eq(projects.id, typedInput.projectId))
    .get();

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found",
    });
  }

  // Allow access if using organization's API key
  if (
    ctx.type === "organization" &&
    ctx.authenticatedId === result.organization.id
  ) {
    return next();
  }

  // Block access if not a member and not using org API key
  if (!result.member && ctx.type !== "organization") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this project",
    });
  }

  return next();
});
