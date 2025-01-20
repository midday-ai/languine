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
      project,
    };
  }

  // Handle user tokens
  const user = await db
    .select()
    .from(users)
    .where(eq(users.apiKey, apiKey))
    .get();

  console.log("user", user);

  if (!user) {
    throw new Error("Invalid user token");
  }

  // Check if user is a member of the organization and project
  const member = await db
    .select()
    .from(projects)
    .leftJoin(
      members,
      and(
        eq(members.organizationId, projects.organizationId),
        eq(members.userId, user.id),
      ),
    )
    .where(eq(projects.id, projectId))
    .get();

  if (!member?.projects) {
    throw new Error("User does not have access to this project");
  }

  return {
    project: member.projects,
  };
}
