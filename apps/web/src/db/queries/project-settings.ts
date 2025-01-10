import { eq } from "drizzle-orm";
import { db } from "..";
import { projectSettings } from "../schema";

export const getProjectSettings = async (projectId: string) => {
  return db
    .select()
    .from(projectSettings)
    .where(eq(projectSettings.projectId, projectId))
    .get();
};

export const updateProjectSettings = async ({
  projectId,
  cache,
  context,
  temperature,
  instructions,
  memory,
  grammar,
}: {
  projectId: string;
  cache?: boolean;
  context?: boolean;
  temperature?: number;
  instructions?: string;
  memory?: boolean;
  grammar?: boolean;
}) => {
  return db
    .update(projectSettings)
    .set({
      cache,
      context,
      temperature,
      instructions,
      memory,
      grammar,
    })
    .where(eq(projectSettings.projectId, projectId))
    .returning()
    .get();
};

export const createProjectSettings = async ({
  projectId,
  cache = true,
  context = true,
  temperature = 0,
  instructions,
  memory = true,
  grammar = true,
}: {
  projectId: string;
  cache?: boolean;
  context?: boolean;
  temperature?: number;
  instructions?: string;
  memory?: boolean;
  grammar?: boolean;
}) => {
  return db
    .insert(projectSettings)
    .values({
      projectId,
      cache,
      context,
      temperature,
      instructions,
      memory,
      grammar,
    })
    .returning()
    .get();
};
