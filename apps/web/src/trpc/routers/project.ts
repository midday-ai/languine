import {
  createProject,
  deleteProject,
  getProjectBySlug,
  updateProject,
  updateProjectSettings,
} from "@/db/queries/project";
import { decrypt } from "@/lib/crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { rateLimitMiddleware } from "../middlewares/ratelimits";
import {
  isOrganizationMember,
  isOrganizationOwner,
} from "../permissions/organization";

export const projectRouter = createTRPCRouter({
  getBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        organizationId: z.string(),
      }),
    )
    .use(isOrganizationMember)
    .query(async ({ input }) => {
      const project = await getProjectBySlug(input);

      if (project?.settings?.providerApiKey) {
        project.settings.providerApiKey = await decrypt(
          project.settings.providerApiKey,
        );
      }

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return project;
    }),

  create: protectedProcedure
    .use(rateLimitMiddleware)
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
    .use(rateLimitMiddleware)
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

  updateSettings: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        organizationId: z.string(),
        settings: z.object({
          provider: z.string().optional(),
          model: z.string().optional(),
          providerApiKey: z.string().optional(),
          translationMemory: z.boolean().optional(),
          qualityChecks: z.boolean().optional(),
          contextDetection: z.boolean().optional(),
          lengthControl: z
            .enum(["flexible", "strict", "exact", "loose"])
            .optional(),
          inclusiveLanguage: z.boolean().optional(),
          formality: z.enum(["casual", "formal", "neutral"]).optional(),
          toneOfVoice: z
            .enum([
              "casual",
              "formal",
              "friendly",
              "professional",
              "playful",
              "serious",
              "confident",
              "humble",
              "direct",
              "diplomatic",
            ])
            .optional(),
          brandName: z.string().optional(),
          brandVoice: z.string().optional(),
          emotiveIntent: z
            .enum([
              "neutral",
              "positive",
              "empathetic",
              "professional",
              "friendly",
              "enthusiastic",
            ])
            .optional(),
          idioms: z.boolean().optional(),
          terminology: z.string().optional(),
          domainExpertise: z
            .enum([
              "general",
              "technical",
              "medical",
              "legal",
              "financial",
              "marketing",
              "academic",
            ])
            .optional(),
        }),
      }),
    )
    .use(rateLimitMiddleware)
    .use(isOrganizationOwner)
    .mutation(async ({ input }) => {
      const project = await updateProjectSettings(input);

      if (!project) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update project settings",
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
    .use(rateLimitMiddleware)
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
