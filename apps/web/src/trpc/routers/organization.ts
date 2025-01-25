import { connectDb } from "@/db";
import {
  acceptInvitation,
  createOrganization,
  deleteOrganization,
  deleteOrganizationInvite,
  deleteOrganizationMember,
  getAllOrganizationsWithProjects,
  getOrganization,
  getOrganizationInvites,
  getOrganizationMembers,
  inviteMember,
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
import {
  isOrganizationMember,
  isOrganizationOwner,
} from "../permissions/organization";
import {
  acceptInvitationSchema,
  createOrganizationSchema,
  deleteOrganizationInviteSchema,
  deleteOrganizationMemberSchema,
  inviteMemberSchema,
  organizationSchema,
  updateOrganizationSchema,
  updateOrganizationTierSchema,
} from "./schema";

export const organizationRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(organizationSchema)
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
    .input(organizationSchema)
    .use(isOrganizationMember)
    .query(async ({ input }) => {
      return getOrganizationMembers(input.organizationId);
    }),

  getInvites: protectedProcedure
    .input(organizationSchema)
    .use(isOrganizationMember)
    .query(async ({ input }) => {
      return getOrganizationInvites(input.organizationId);
    }),

  create: protectedProcedure
    .input(createOrganizationSchema)
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
    .input(updateOrganizationSchema)
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
    .input(organizationSchema)
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
    .input(deleteOrganizationInviteSchema)
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
    .input(deleteOrganizationMemberSchema)
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      const db = await connectDb();

      const otherOwners = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.organizationId, input.organizationId),
            eq(members.role, "owner"),
            ne(members.id, input.memberId),
          ),
        );

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
    .input(organizationSchema)
    .use(isOrganizationMember)
    .mutation(async ({ input, ctx }) => {
      const db = await connectDb();

      const otherOwners = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.organizationId, input.organizationId),
            eq(members.role, "owner"),
            ne(members.userId, ctx.authenticatedId),
          ),
        );

      if (otherOwners.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot leave as the last owner of the organization",
        });
      }

      return leaveOrganization(input.organizationId, ctx.authenticatedId);
    }),

  updateApiKey: protectedProcedure
    .input(organizationSchema)
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      return updateOrganizationApiKey(input.organizationId);
    }),

  updatePlan: protectedProcedure
    .input(updateOrganizationTierSchema)
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      return updateOrganizationTier(input.organizationId, input.tier);
    }),

  inviteMember: protectedProcedure
    .input(inviteMemberSchema)
    .use(isOrganizationOwner)
    .mutation(async ({ input, ctx }) => {
      try {
        const invite = await inviteMember({
          organizationId: input.organizationId,
          email: input.email,
          role: input.role,
          inviterId: ctx.authenticatedId,
        });

        return invite;
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to invite member",
        });
      }
    }),

  acceptInvitation: protectedProcedure
    .input(acceptInvitationSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await acceptInvitation(input.invitationId);
        return result;
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to accept invitation",
        });
      }
    }),
});
