import { connectDb } from "@/db";
import {
  invitations,
  members,
  organizations,
  projects,
  sessions,
  translations,
  users,
} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, count, eq, sql } from "drizzle-orm";
import slugify from "slugify";

export async function createDefaultOrganization(user: {
  id: string;
  name: string;
}) {
  const db = await connectDb();

  // Create default organization for new user
  const [org] = await db
    .insert(organizations)
    .values({
      name: user.name,
      slug: `${slugify(user.name, { lower: true })}-${createId().slice(0, 8)}`,
    })
    .returning();

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
  const db = await connectDb();

  const [org] = await db
    .insert(organizations)
    .values({
      name,
      slug: `${slugify(name, { lower: true })}-${createId().slice(0, 8)}`,
    })
    .returning();

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
  const db = await connectDb();

  return db.delete(organizations).where(eq(organizations.id, id)).returning();
};

export const getDefaultOrganization = async (userId: string) => {
  const db = await connectDb();

  return db.query.members.findFirst({
    where: eq(members.userId, userId),
    with: {
      organization: true,
    },
  });
};

export const getAllOrganizationsWithProjects = async (userId: string) => {
  const db = await connectDb();

  return db.query.organizations.findMany({
    with: {
      projects: true,
    },
  });
};

export const getOrganization = async (id: string) => {
  const db = await connectDb();

  return db.query.organizations.findFirst({
    where: eq(organizations.id, id),
  });
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
  const db = await connectDb();

  return db
    .update(organizations)
    .set({
      name,
      logo,
    })
    .where(eq(organizations.id, id))
    .returning();
};

export const getOrganizationMembers = async (organizationId: string) => {
  const db = await connectDb();

  return db.query.members.findMany({
    where: eq(members.organizationId, organizationId),
    with: {
      user: true,
    },
  });
};

export const getOrganizationInvites = async (organizationId: string) => {
  const db = await connectDb();

  return db.query.invitations.findMany({
    where: eq(invitations.organizationId, organizationId),
    with: {
      inviter: true,
    },
    columns: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
    },
  });
};

export const deleteOrganizationInvite = async (inviteId: string) => {
  const db = await connectDb();

  return db.delete(invitations).where(eq(invitations.id, inviteId)).returning();
};

export const deleteOrganizationMember = async (memberId: string) => {
  const db = await connectDb();

  return db.delete(members).where(eq(members.id, memberId)).returning();
};

export const getOrganizationInvite = async (invitationId: string) => {
  const db = await connectDb();

  return db.query.invitations.findFirst({
    where: eq(invitations.id, invitationId),
    with: {
      organization: {
        columns: {
          name: true,
        },
      },
    },
  });
};

export const deleteInvitation = async (invitationId: string) => {
  const db = await connectDb();

  return db
    .delete(invitations)
    .where(eq(invitations.id, invitationId))
    .returning();
};

export const leaveOrganization = async (
  organizationId: string,
  userId: string,
) => {
  const db = await connectDb();

  return db
    .delete(members)
    .where(
      and(
        eq(members.organizationId, organizationId),
        eq(members.userId, userId),
      ),
    )
    .returning();
};

export const updateOrganizationApiKey = async (organizationId: string) => {
  const db = await connectDb();

  return db
    .update(organizations)
    .set({ apiKey: `org_${createId()}` })
    .where(eq(organizations.id, organizationId))
    .returning();
};

export const getOrganizationLimits = async (organizationId: string) => {
  const db = await connectDb();

  const [result] = await db
    .select({
      totalKeys: count(
        sql`CASE WHEN ${translations.sourceType} = 'key' THEN 1 END`,
      ).as("totalKeys"),
      totalDocuments: count(
        sql`CASE WHEN ${translations.sourceType} = 'document' THEN 1 END`,
      ).as("totalDocuments"),
    })
    .from(translations)
    .where(eq(translations.organizationId, organizationId));

  return {
    totalKeys: result?.totalKeys ?? 0,
    totalDocuments: result?.totalDocuments ?? 0,
  };
};

export const updateOrganizationTier = async (
  organizationId: string,
  tier: number,
) => {
  const plan = tier === 0 ? "free" : "pro";

  const db = await connectDb();

  return db
    .update(organizations)
    .set({ tier, plan })
    .where(eq(organizations.id, organizationId))
    .returning();
};
