import { db } from "@/db";
import { members, organizations } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { t } from "../init";

export const isOrganizationMember = t.middleware(
  async ({ ctx, next, input }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const typedInput = input as { organizationId: string };

    const result = await db
      .select({
        member: members,
      })
      .from(organizations)
      .leftJoin(
        members,
        and(
          eq(members.organizationId, typedInput.organizationId),
          eq(members.userId, ctx.user.id),
        ),
      )
      .where(eq(organizations.id, typedInput.organizationId))
      .get();

    if (!result) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    if (!result.member) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not a member of this organization",
      });
    }

    return next();
  },
);
