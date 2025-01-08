import { db } from "@/db";
import { members, organizations, projects, sessions } from "@/db/schema";
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
