import { connectDb } from "@/db";
import { members, organizations } from "@/db/schema";
import { t } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

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

    const db = await connectDb();

    // Check if user is a member of the organization
    const result = await db.query.members.findFirst({
      where: and(
        eq(members.organizationId, typedInput.organizationId),
        eq(members.userId, ctx.authenticatedId),
      ),
      with: {
        organization: true,
      },
    });

    if (!result) {
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

    const db = await connectDb();

    // Check if user is an owner of the organization
    const result = await db.query.organizations.findFirst({
      where: eq(organizations.id, typedInput.organizationId),
      with: {
        members: {
          where: and(
            eq(members.userId, ctx.authenticatedId),
            eq(members.role, "owner"),
          ),
        },
      },
    });

    if (!result) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not an owner of this organization",
      });
    }

    return next();
  },
);
