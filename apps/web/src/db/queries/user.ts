import { createId } from "@paralleldrive/cuid2";
import { and, eq, ne } from "drizzle-orm";
import { db } from "..";
import { members, organizations, users } from "../schema";

export const updateUser = async ({
  id,
  name,
  email,
}: {
  id: string;
  name?: string;
  email?: string;
}) => {
  return db
    .update(users)
    .set({
      ...(name && { name }),
      ...(email && { email }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning()
    .get();
};

export const deleteUser = async ({ id }: { id: string }) => {
  // Get all organizations where user is a member
  const userOrgs = await db
    .select({
      organizationId: members.organizationId,
      role: members.role,
    })
    .from(members)
    .where(eq(members.userId, id))
    .all();

  // For each org where user is owner, check if they're the last owner
  for (const org of userOrgs) {
    if (org.role === "owner") {
      const otherOwners = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.organizationId, org.organizationId),
            eq(members.role, "owner"),
            ne(members.userId, id),
          ),
        )
        .all();

      // If no other owners, delete the organization
      if (otherOwners.length === 0) {
        await db
          .delete(organizations)
          .where(eq(organizations.id, org.organizationId));
      }
    }
  }

  // Finally delete the user
  return db.delete(users).where(eq(users.id, id)).returning().get();
};

export const getUserById = async ({ id }: { id: string }) => {
  return db.select().from(users).where(eq(users.id, id)).get();
};

export const updateUserApiKey = async (userId: string) => {
  return db
    .update(users)
    .set({ apiKey: `user_${createId()}` })
    .where(eq(users.id, userId))
    .returning()
    .get();
};
