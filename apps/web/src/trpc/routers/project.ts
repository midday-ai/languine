import {
  createProject,
  deleteProject,
  getProjectBySlug,
  updateProject,
} from "@/db/queries/project";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { isOrganizationOwner } from "../permissions/organization";
import { isProjectMember } from "../permissions/project";

export const projectRouter = createTRPCRouter({
  getBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        organizationId: z.string(),
      }),
    )
    .use(isProjectMember)
    .query(async ({ input }) => {
      const project = await getProjectBySlug(input);

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return project;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        organizationId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const project = await createProject(input);

      if (!project) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }

      return project;
    }),

  update: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        organizationId: z.string(),
        name: z.string().min(1),
      }),
    )
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      const project = await updateProject(input);

      if (!project) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update project",
        });
      }

      return project;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        organizationId: z.string(),
      }),
    )
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      const project = await deleteProject(input);

      if (!project) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete project",
        });
      }

      return project;
    }),
});
