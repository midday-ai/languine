import { db } from "@/db";
import {
  invitations,
  members,
  organizations,
  projects,
  sessions,
  users,
} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import slugify from "slugify";

export async function createDefaultOrganization(user: {
  id: string;
  name: string;
}) {
  // Create default organization for new user
  const org = await db
    .insert(organizations)
    .values({
      name: user.name,
      slug: `${slugify(user.name, { lower: true })}-${createId().slice(0, 8)}`,
    })
    .returning()
    .get();

  // Add user as member of organization
  await db.insert(members).values({
    userId: user.id,
    organizationId: org.id,
    role: "owner",
  });

  // Create default project for new organization
  await db.insert(projects).values({
    name: "Default",
    organizationId: org.id,
    slug: "default",
  });

  // Set active organization for new user's session
  await db
    .update(sessions)
    .set({ activeOrganizationId: org.id })
    .where(eq(sessions.userId, user.id));

  return org;
}

export const createOrganization = async ({
  name,
  userId,
}: {
  name: string;
  userId: string;
}) => {
  const org = await db
    .insert(organizations)
    .values({
      name,
      slug: `${slugify(name, { lower: true })}-${createId().slice(0, 8)}`,
    })
    .returning()
    .get();

  if (org) {
    await db.insert(members).values({
      userId,
      organizationId: org.id,
      role: "owner",
    });

    await db.insert(projects).values({
      name: "Default",
      organizationId: org.id,
      slug: "default",
    });
  }

  return org;
};

export const deleteOrganization = async (id: string) => {
  return db
    .delete(organizations)
    .where(eq(organizations.id, id))
    .returning()
    .get();
};

export const getDefaultOrganization = async (userId: string) => {
  return db
    .select()
    .from(members)
    .where(eq(members.userId, userId))
    .leftJoin(organizations, eq(organizations.id, members.organizationId))
    .limit(1)
    .get();
};

export const getAllOrganizationsWithProjects = async (userId: string) => {
  const orgs = await db
    .select()
    .from(organizations)
    .leftJoin(members, eq(members.organizationId, organizations.id))
    .where(eq(members.userId, userId))
    .all();

  const orgsWithProjects = await Promise.all(
    orgs.map(async (org) => {
      const orgProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.organizationId, org.organizations.id))
        .all();

      return {
        ...org.organizations,
        projects: orgProjects,
      };
    }),
  );

  return orgsWithProjects;
};

export const getOrganization = async (id: string) => {
  return db.select().from(organizations).where(eq(organizations.id, id)).get();
};

export const getProjectById = async (projectId: string) => {
  return db.select().from(projects).where(eq(projects.id, projectId)).get();
};

export const updateOrganization = async ({
  id,
  name,
  logo,
}: {
  id: string;
  name: string;
  logo?: string;
}) => {
  return db
    .update(organizations)
    .set({
      name,
      logo,
    })
    .where(eq(organizations.id, id))
    .returning()
    .get();
};

export const getOrganizationMembers = async (organizationId: string) => {
  return db
    .select({
      id: members.id,
      role: members.role,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .where(eq(members.organizationId, organizationId))
    .all();
};

export const getOrganizationInvites = async (organizationId: string) => {
  return db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      inviter: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(invitations)
    .innerJoin(users, eq(invitations.inviterId, users.id))
    .where(eq(invitations.organizationId, organizationId))
    .all();
};

export const deleteOrganizationInvite = async (inviteId: string) => {
  console.log("deleteOrganizationInvite", inviteId);
  return db
    .delete(invitations)
    .where(eq(invitations.id, inviteId))
    .returning()
    .get();
};
