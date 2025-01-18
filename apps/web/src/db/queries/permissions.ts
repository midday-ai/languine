import { and, eq } from "drizzle-orm";
import { db } from "..";
import { members } from "../schema";
import { projects, users } from "../schema";
import { organizations } from "../schema";

export async function validateJobPermissions({
  apiKey,
  projectId,
}: {
  apiKey: string;
  projectId: string;
}) {
  if (apiKey.startsWith("org_")) {
    const org = await db
      .select()
      .from(organizations)
      .where(eq(organizations.apiKey, apiKey))
      .get();

    if (!org) {
      throw new Error("Invalid organization token");
    }

    const project = await db
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.organizationId, org.id)),
      )
      .get();

    if (!project) {
      throw new Error("Project does not belong to this organization");
    }

    return { type: "organization", org, project };
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.apiKey, apiKey))
    .get();

  if (!user) {
    throw new Error("Invalid user token");
  }

  const member = await db
    .select()
    .from(members)
    .where(
      and(eq(members.userId, user.id), eq(members.organizationId, projectId)),
    )
    .get();

  if (!member) {
    throw new Error("User does not have access to this project");
  }

  return { type: "user", user, member };
}
