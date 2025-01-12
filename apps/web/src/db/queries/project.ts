import { and, eq } from "drizzle-orm";
import slugify from "slugify";
import { db } from "..";
import { projects } from "../schema";

export const createProject = async ({
  name,
  organizationId,
}: {
  name: string;
  organizationId: string;
}) => {
  return db
    .insert(projects)
    .values({
      name,
      organizationId,
      slug: slugify(name, { lower: true }),
    })
    .returning()
    .get();
};

export const updateProject = async ({
  slug,
  name,
  organizationId,
}: {
  slug: string;
  name: string;
  organizationId: string;
}) => {
  return db
    .update(projects)
    .set({ name })
    .where(
      and(eq(projects.slug, slug), eq(projects.organizationId, organizationId)),
    )
    .returning()
    .get();
};

export const deleteProject = async ({
  slug,
  organizationId,
}: {
  slug: string;
  organizationId: string;
}) => {
  return db
    .delete(projects)
    .where(
      and(eq(projects.slug, slug), eq(projects.organizationId, organizationId)),
    )
    .returning()
    .get();
};

export const getProjectBySlug = async ({
  slug,
  organizationId,
}: {
  slug: string;
  organizationId: string;
}) => {
  return db
    .select()
    .from(projects)
    .where(
      and(eq(projects.slug, slug), eq(projects.organizationId, organizationId)),
    )
    .get();
};

export const getProjectByOrganizationId = async ({
  organizationId,
}: {
  organizationId: string;
}) => {
  return db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, organizationId))
    .get();
};
