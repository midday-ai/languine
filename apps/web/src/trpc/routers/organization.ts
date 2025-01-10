import {
  createOrganization,
  deleteOrganization,
  getAllOrganizationsWithProjects,
  getOrganization,
  updateOrganization,
} from "@/db/queries/organization";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const organizationRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const org = await getOrganization(input.id);

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

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const org = await createOrganization(input);

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
        id: z.string(),
        name: z.string().min(1),
        logo: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const org = await updateOrganization(input);

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update organization",
        });
      }

      return org;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const org = await deleteOrganization(input.id);

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete organization",
        });
      }

      return org;
    }),
});
