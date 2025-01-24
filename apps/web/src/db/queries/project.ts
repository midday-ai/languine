import { connectDb } from "@/db";
import { projectSettings, projects } from "@/db/schema";
import type { ProjectSettings } from "@/trpc/routers/schema";
import { and, eq } from "drizzle-orm";
import slugify from "slugify";

export const createProject = async ({
  name,
  organizationId,
}: {
  name: string;
  organizationId: string;
}) => {
  const db = await connectDb();

  const [project] = await db
    .insert(projects)
    .values({
      name,
      organizationId,
      slug: slugify(name, { lower: true }),
    })
    .returning();

  return project;
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
  const db = await connectDb();

  const [project] = await db
    .update(projects)
    .set({ name })
    .where(
      and(eq(projects.slug, slug), eq(projects.organizationId, organizationId)),
    )
    .returning();

  return project;
};

export const deleteProject = async ({
  slug,
  organizationId,
}: {
  slug: string;
  organizationId: string;
}) => {
  const db = await connectDb();

  const [project] = await db
    .delete(projects)
    .where(
      and(eq(projects.slug, slug), eq(projects.organizationId, organizationId)),
    )
    .returning();

  return project;
};

export const getProjectBySlug = async ({
  slug,
  organizationId,
}: {
  slug: string;
  organizationId: string;
}) => {
  const db = await connectDb();

  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      description: projects.description,
      organizationId: projects.organizationId,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      settings: projectSettings,
    })
    .from(projects)
    .leftJoin(projectSettings, eq(projects.id, projectSettings.projectId))
    .where(
      and(eq(projects.slug, slug), eq(projects.organizationId, organizationId)),
    );

  return project;
};

export const getProjectById = async ({
  id,
}: {
  id: string;
}) => {
  const db = await connectDb();

  const [project] = await db.select().from(projects).where(eq(projects.id, id));

  return project;
};

export const getProjectByOrganizationId = async ({
  organizationId,
}: {
  organizationId: string;
}) => {
  const db = await connectDb();

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, organizationId));

  return project;
};

export const updateProjectSettings = async ({
  slug,
  organizationId,
  settings,
}: {
  slug: string;
  organizationId: string;
  settings: ProjectSettings;
}) => {
  const db = await connectDb();

  const [project] = await db
    .select({
      id: projects.id,
    })
    .from(projects)
    .where(
      and(eq(projects.slug, slug), eq(projects.organizationId, organizationId)),
    );

  if (!project) return null;

  const projectId = project.id;
  const whereClause = and(
    eq(projectSettings.projectId, projectId),
    eq(projectSettings.organizationId, organizationId),
  );

  const settingsToUpdate = {
    ...settings,
  };

  const [updated] = await db
    .update(projectSettings)
    .set(settingsToUpdate)
    .where(whereClause)
    .returning();

  if (updated) return updated;

  const [newSettings] = await db
    .insert(projectSettings)
    .values({
      ...settingsToUpdate,
      projectId,
      organizationId,
    })
    .returning();

  return newSettings;
};
