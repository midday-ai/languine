import { db } from "@/db";
import { eq } from "drizzle-orm";
import { members, organizations, projects } from "../schema";

export const getDefaultOrganization = async (userId: string) => {
  return await db
    .select()
    .from(members)
    .where(eq(members.userId, userId))
    .leftJoin(organizations, eq(organizations.id, members.organizationId))
    .limit(1)
    .get();
};

export const getAllOrganizationsWithProjects = async () => {
  const orgs = await db.select().from(organizations).all();

  const orgsWithProjects = await Promise.all(
    orgs.map(async (org) => {
      const orgProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.organizationId, org.id))
        .all();

      return {
        ...org,
        projects: orgProjects,
      };
    }),
  );

  return orgsWithProjects;
};
