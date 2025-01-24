import { db } from "@/db";
import { members, organizations } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { t } from "../init";

/**
 * Middleware to check if the authenticated user is a member of the specified organization.
 * Also allows access if the request is made with an organization's API key.
 */
export const isOrganizationMember = t.middleware(
  async ({ ctx, next, input }) => {
    // Ensure user is authenticated
    if (!ctx.authenticatedId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const typedInput = input as { organizationId: string };

    // Allow access if using organization's API key
    if (
      ctx.type === "organization" &&
      ctx.authenticatedId === typedInput.organizationId
    ) {
      return next();
    }

    // Check if user is a member of the organization
    const result = await db
      .select({
        member: members,
      })
      .from(organizations)
      .leftJoin(
        members,
        and(
          eq(members.organizationId, typedInput.organizationId),
          eq(members.userId, ctx.authenticatedId),
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

    // Block access if not a member and not using org API key
    if (!result.member && ctx.type !== "organization") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not a member of this organization",
      });
    }

    return next();
  },
);

/**
 * Middleware to check if the authenticated user is an owner of the specified organization.
 * Also allows access if the request is made with an organization's API key.
 */
export const isOrganizationOwner = t.middleware(
  async ({ ctx, next, input }) => {
    // Ensure user is authenticated
    if (!ctx.authenticatedId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }

    const typedInput = input as { organizationId: string };

    // Allow access if using organization's API key
    if (
      ctx.type === "organization" &&
      ctx.authenticatedId === typedInput.organizationId
    ) {
      return next();
    }

    // Check if user is an owner of the organization
    const result = await db
      .select({
        member: members,
      })
      .from(organizations)
      .leftJoin(
        members,
        and(
          eq(members.organizationId, typedInput.organizationId),
          eq(members.userId, ctx.authenticatedId),
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

    // Block access if not an owner and not using org API key
    if (result.member?.role !== "owner" && ctx.type !== "organization") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not an owner of this organization",
      });
    }

    return next();
  },
);
