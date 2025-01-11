import { db } from "@/db";
import { members, organizations, projects } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { t } from "../init";

export const isProjectMember = t.middleware(async ({ ctx, next, input }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }

  const typedInput = input as { slug: string; organizationId: string };

  const result = await db
    .select({
      member: members,
      project: projects,
    })
    .from(projects)
    .innerJoin(organizations, eq(organizations.id, typedInput.organizationId))
    .leftJoin(
      members,
      and(
        eq(members.organizationId, typedInput.organizationId),
        eq(members.userId, ctx.user.id),
      ),
    )
    .where(
      and(
        eq(projects.slug, typedInput.slug),
        eq(projects.organizationId, typedInput.organizationId),
      ),
    )
    .get();

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found",
    });
  }

  if (!result.member) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have access to this project",
    });
  }

  return next();
});
