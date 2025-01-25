import { primaryDb } from "@/db/primary";
import { members, organizations, projects, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function validateJobPermissions({
  apiKey,
  projectId,
}: {
  apiKey: string;
  projectId: string;
}) {
  // Handle organization tokens
  if (apiKey.startsWith("org_")) {
    const org = await primaryDb.query.organizations.findFirst({
      where: eq(organizations.apiKey, apiKey),
    });

    if (!org) {
      throw new Error("Invalid organization token");
    }

    const project = await primaryDb.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.organizationId, org.id),
      ),
    });

    if (!project) {
      throw new Error("Project does not belong to this organization");
    }

    return {
      project,
    };
  }

  // Handle user tokens
  const user = await primaryDb.query.users.findFirst({
    where: eq(users.apiKey, apiKey),
  });

  if (!user) {
    throw new Error("Invalid user token");
  }

  // Check if user is a member of the organization and project
  const project = await primaryDb.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      organization: {
        with: {
          members: {
            where: eq(members.userId, user.id),
          },
        },
      },
    },
  });

  if (!project || !project.organization.members.length) {
    throw new Error("User does not have access to this project");
  }

  return {
    project,
  };
}
