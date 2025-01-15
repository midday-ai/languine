import { encrypt } from "@/lib/crypto";
import { and, eq } from "drizzle-orm";
import slugify from "slugify";
import { db } from "..";
import { projectSettings, projects } from "../schema";

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
  const project = db
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
    )
    .get();

  return project;
};

export const getProjectById = async ({
  id,
}: {
  id: string;
}) => {
  return db.select().from(projects).where(eq(projects.id, id)).get();
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

export const updateProjectSettings = async ({
  slug,
  organizationId,
  settings,
}: {
  slug: string;
  organizationId: string;
  settings: {
    provider?: string;
    model?: string;
    providerApiKey?: string;
  };
}) => {
  const project = await db
    .select({
      id: projects.id,
    })
    .from(projects)
    .where(
      and(eq(projects.slug, slug), eq(projects.organizationId, organizationId)),
    )
    .get();

  if (!project) return null;

  const projectId = project.id;
  const whereClause = and(
    eq(projectSettings.projectId, projectId),
    eq(projectSettings.organizationId, organizationId),
  );

  const settingsToUpdate = {
    ...settings,
  };

  if (settings.providerApiKey) {
    settingsToUpdate.providerApiKey = await encrypt(settings.providerApiKey);
  }

  const updated = await db
    .update(projectSettings)
    .set(settingsToUpdate)
    .where(whereClause)
    .returning()
    .get();

  if (updated) return updated;

  return db
    .insert(projectSettings)
    .values({
      ...settingsToUpdate,
      projectId,
      organizationId,
    })
    .returning()
    .get();
};
