import { connectDb } from "@/db";
import {
  invitations,
  members,
  organizations,
  projects,
  translations,
  users,
} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, count, eq, sql } from "drizzle-orm";

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

type OrganizationWithProjects = {
  id: string;
  name: string;
  logo: string | null;
  createdAt: Date;
  updatedAt: Date;
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

export const getAllOrganizationsWithProjects = async (
  userId: string,
): Promise<OrganizationWithProjects[]> => {
  const db = await connectDb();

  const result = await db.query.members.findMany({
    where: eq(members.userId, userId),
    with: {
      organization: {
        with: {
          projects: true,
        },
      },
    },
  });

  // Create a Map to store unique organizations by ID
  const uniqueOrgs = new Map();

  for (const member of result) {
    if (!uniqueOrgs.has(member.organization.id)) {
      uniqueOrgs.set(member.organization.id, {
        ...member.organization,
        projects: member.organization.projects,
      });
    }
  }

  return Array.from(uniqueOrgs.values());
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
  email,
  tier,
  plan,
  polarCustomerId,
  canceledAt,
}: {
  id: string;
  name?: string;
  logo?: string;
  email?: string;
  tier?: number;
  plan?: "free" | "pro";
  polarCustomerId?: string;
  canceledAt?: Date | null;
}) => {
  const db = await connectDb();

  return db
    .update(organizations)
    .set({
      name,
      logo,
      email,
      tier,
      plan,
      polarCustomerId,
      canceledAt,
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

  const [result] = await db
    .update(organizations)
    .set({ apiKey: `org_${createId()}` })
    .where(eq(organizations.id, organizationId))
    .returning();

  return result;
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

export const getOrganizationByUserId = async (userId: string) => {
  const db = await connectDb();

  return db.query.members.findFirst({
    where: eq(members.userId, userId),
    with: {
      organization: true,
    },
  });
};

export const inviteMember = async ({
  organizationId,
  email,
  role,
  inviterId,
}: {
  organizationId: string;
  email: string;
  role: string;
  inviterId: string;
}) => {
  const db = await connectDb();

  // Check if user is already a member
  const [existingMember] = await db
    .select()
    .from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .where(
      and(eq(members.organizationId, organizationId), eq(users.email, email)),
    )
    .limit(1);

  if (existingMember) {
    throw new Error("User is already a member of this organization");
  }

  // Check if there's already a pending invitation
  const existingInvite = await db.query.invitations.findFirst({
    where: and(
      eq(invitations.organizationId, organizationId),
      eq(invitations.email, email),
      eq(invitations.status, "pending"),
    ),
  });

  if (existingInvite) {
    throw new Error("User already has a pending invitation");
  }

  // Create invitation
  const [invitation] = await db
    .insert(invitations)
    .values({
      organizationId,
      email,
      role,
      status: "pending",
      inviterId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    })
    .returning();

  return invitation;
};

export const acceptInvitation = async (invitationId: string) => {
  const db = await connectDb();

  // Get the invitation
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.id, invitationId),
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation is no longer valid");
  }

  if (new Date() > invitation.expiresAt) {
    throw new Error("Invitation has expired");
  }

  // Add user as member
  const [member] = await db
    .insert(members)
    .values({
      organizationId: invitation.organizationId,
      userId: invitation.inviterId,
      role: invitation.role || "member",
    })
    .returning();

  // Update invitation status
  await db
    .update(invitations)
    .set({ status: "accepted" })
    .where(eq(invitations.id, invitationId));

  return { member, invitation };
};

export const getOrganizationStats = async (organizationId: string) => {
  const db = await connectDb();

  // Get organization details including tier
  const organization = await db.query.organizations.findFirst({
    where: eq(organizations.id, organizationId),
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  // Get total keys and documents
  const { totalKeys, totalDocuments } =
    await getOrganizationLimits(organizationId);

  // Get total languages by counting distinct target languages
  const languages = await db
    .selectDistinct({
      targetLanguage: translations.targetLanguage,
    })
    .from(translations)
    .where(eq(translations.organizationId, organizationId));

  const totalLanguages = languages.length;

  return {
    totalKeys,
    totalDocuments,
    totalLanguages,
    tier: organization.tier,
    plan: organization.plan,
    polarCustomerId: organization.polarCustomerId,
    canceledAt: organization.canceledAt,
  };
};

export const isUserOrganizationMember = async (
  userId: string,
  organizationId: string,
) => {
  const db = await connectDb();

  const member = await db.query.members.findFirst({
    where: and(
      eq(members.userId, userId),
      eq(members.organizationId, organizationId),
    ),
  });

  return !!member;
};
