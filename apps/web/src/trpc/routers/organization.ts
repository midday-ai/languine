import { db } from "@/db";
import {
  createOrganization,
  deleteOrganization,
  deleteOrganizationInvite,
  deleteOrganizationMember,
  getAllOrganizationsWithProjects,
  getOrganization,
  getOrganizationInvites,
  getOrganizationMembers,
  leaveOrganization,
  updateOrganization,
  updateOrganizationApiKey,
  updateOrganizationTier,
} from "@/db/queries/organization";
import { members } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, ne } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { rateLimitMiddleware } from "../middlewares/ratelimits";
import {
  isOrganizationMember,
  isOrganizationOwner,
} from "../permissions/organization";

export const organizationRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .use(isOrganizationMember)
    .query(async ({ input }) => {
      const org = await getOrganization(input.organizationId);

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      return org;
    }),

  getAll: protectedProcedure.input(z.void()).query(async ({ ctx }) => {
    return getAllOrganizationsWithProjects(ctx.authenticatedId);
  }),

  getMembers: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .use(isOrganizationMember)
    .query(async ({ input }) => {
      return getOrganizationMembers(input.organizationId);
    }),

  getInvites: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .use(isOrganizationMember)
    .query(async ({ input }) => {
      return getOrganizationInvites(input.organizationId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .use(rateLimitMiddleware)
    .mutation(async ({ input, ctx }) => {
      const org = await createOrganization({
        name: input.name,
        userId: ctx.authenticatedId,
      });

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization",
        });
      }

      return org;
    }),

  update: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        name: z.string().min(1),
        logo: z.string().optional(),
      }),
    )
    .use(rateLimitMiddleware)
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      const org = await updateOrganization({
        id: input.organizationId,
        name: input.name,
        logo: input.logo,
      });

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update organization",
        });
      }

      return org;
    }),

  delete: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .use(rateLimitMiddleware)
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      const members = await getOrganizationMembers(input.organizationId);

      if (members.length === 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Cannot delete organization when you are the only member, instead delete your account",
        });
      }

      const org = await deleteOrganization(input.organizationId);

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete organization",
        });
      }

      return org;
    }),

  deleteInvite: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        inviteId: z.string(),
      }),
    )
    .use(rateLimitMiddleware)
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      const invite = await deleteOrganizationInvite(input.inviteId);

      if (!invite) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete organization invite",
        });
      }

      return invite;
    }),

  deleteMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        memberId: z.string(),
      }),
    )
    .use(rateLimitMiddleware)
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      const otherOwners = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.organizationId, input.organizationId),
            eq(members.role, "owner"),
            ne(members.id, input.memberId),
          ),
        )
        .all();

      if (otherOwners.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Organization must have at least one owner. Transfer ownership to another member before removing this owner.",
        });
      }

      const deletedMember = await deleteOrganizationMember(input.memberId);

      if (!deletedMember) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove organization member",
        });
      }

      return deletedMember;
    }),

  leave: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .use(rateLimitMiddleware)
    .use(isOrganizationMember)
    .mutation(async ({ input, ctx }) => {
      const otherOwners = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.organizationId, input.organizationId),
            eq(members.role, "owner"),
            ne(members.userId, ctx.authenticatedId),
          ),
        )
        .all();

      if (otherOwners.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot leave as the last owner of the organization",
        });
      }

      return leaveOrganization(input.organizationId, ctx.authenticatedId);
    }),

  updateApiKey: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .use(rateLimitMiddleware)
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      return updateOrganizationApiKey(input.organizationId);
    }),

  updatePlan: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        tier: z.number().min(0).max(5),
      }),
    )
    .use(rateLimitMiddleware)
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      return updateOrganizationTier(input.organizationId, input.tier);
    }),
});
