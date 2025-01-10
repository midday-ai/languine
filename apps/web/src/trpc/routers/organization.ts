import {
  createOrganization,
  deleteOrganization,
  getAllOrganizationsWithProjects,
  getOrganization,
  getOrganizationInvites,
  getOrganizationMembers,
  updateOrganization,
} from "@/db/queries/organization";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { isOrganizationMember } from "../middleware/organization";

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
    return getAllOrganizationsWithProjects(ctx.user.id);
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
    .mutation(async ({ input, ctx }) => {
      const org = await createOrganization({
        name: input.name,
        userId: ctx.user.id,
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
    .use(isOrganizationMember)
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
    .use(isOrganizationMember)
    .mutation(async ({ input }) => {
      const org = await deleteOrganization(input.organizationId);

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete organization",
        });
      }

      return org;
    }),
});
