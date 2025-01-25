import { UTCDate } from "@date-fns/utc";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, ne } from "drizzle-orm";
import { connectDb } from "..";
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
  const db = await connectDb();

  const [user] = await db
    .update(users)
    .set({
      ...(name && { name }),
      ...(email && { email }),
      updatedAt: new UTCDate(),
    })
    .where(eq(users.id, id))
    .returning();

  return user;
};

export const deleteUser = async ({ id }: { id: string }) => {
  const db = await connectDb();

  // Get all organizations where user is a member
  const userOrgs = await db
    .select({
      organizationId: members.organizationId,
      role: members.role,
    })
    .from(members)
    .where(eq(members.userId, id));

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
        );

      // If no other owners, delete the organization
      if (otherOwners.length === 0) {
        await db
          .delete(organizations)
          .where(eq(organizations.id, org.organizationId));
      }
    }
  }

  // Finally delete the user
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning();

  return deletedUser;
};

export const getUserById = async ({ id }: { id: string }) => {
  const db = await connectDb();

  const [user] = await db.select().from(users).where(eq(users.id, id));

  return user;
};

export const updateUserApiKey = async (userId: string) => {
  const db = await connectDb();

  const [user] = await db
    .update(users)
    .set({ apiKey: `user_${createId()}` })
    .where(eq(users.id, userId))
    .returning();

  return user;
};
