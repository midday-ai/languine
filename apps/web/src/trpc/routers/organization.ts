import { db } from "@/db";
import { getAllOrganizationsWithProjects } from "@/db/queries/select";
import { members, organizations, projects } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import slugify from "slugify";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const organizationRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const org = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.id))
        .get();

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      return org;
    }),

  getAll: protectedProcedure.input(z.void()).query(async () => {
    return getAllOrganizationsWithProjects();
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const org = await db
        .insert(organizations)
        .values({
          name: input.name,
          slug: `${slugify(input.name, { lower: true })}-${createId().slice(0, 8)}`,
        })
        .returning()
        .get();

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization",
        });
      }

      await db.insert(members).values({
        userId: input.userId,
        organizationId: org.id,
        role: "owner",
      });

      await db.insert(projects).values({
        name: "Default",
        organizationId: org.id,
        slug: "default",
      });

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
      const org = await db
        .update(organizations)
        .set({
          name: input.name,
          logo: input.logo,
        })
        .where(eq(organizations.id, input.id))
        .returning()
        .get();

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
      const org = await db
        .delete(organizations)
        .where(eq(organizations.id, input.id))
        .returning()
        .get();

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete organization",
        });
      }

      return org;
    }),
});
