import { and, eq } from "drizzle-orm";
import { db } from "..";
import { members, organizations, projects, users } from "../schema";

export async function validateJobPermissions({
  apiKey,
  projectId,
}: {
  apiKey: string;
  projectId: string;
}) {
  // Handle organization tokens
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

    return {
      type: "organization",
      org,
      project,
    };
  }

  // Handle user tokens
  const user = await db
    .select()
    .from(users)
    .where(eq(users.apiKey, apiKey))
    .get();

  if (!user) {
    throw new Error("Invalid user token");
  }

  // Check if user is a member of the organization and project
  const member = await db
    .select()
    .from(members)
    .innerJoin(organizations, eq(members.organizationId, organizations.id))
    .innerJoin(projects, eq(projects.organizationId, organizations.id))
    .where(and(eq(members.userId, user.id), eq(projects.id, projectId)))
    .get();

  if (!member) {
    throw new Error("User does not have access to this project");
  }

  return {
    type: "user",
    user,
    member,
  };
}
