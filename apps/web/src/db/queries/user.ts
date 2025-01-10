import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

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
  return db.delete(users).where(eq(users.id, id)).returning().get();
};

export const getUserById = async ({ id }: { id: string }) => {
  return db.select().from(users).where(eq(users.id, id)).get();
};
