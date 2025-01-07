import { db } from "@/db";
import { members, organizations, projects, sessions } from "@/db/schema";
import WelcomeEmail from "@/emails/templates/welcome";
import { createId } from "@paralleldrive/cuid2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { Resend } from "resend";
import slugify from "slugify";

export const setupAuth = (c: Context) => {
  return betterAuth({
    database: drizzleAdapter(db(c.env.DB), {
      provider: "sqlite",
      usePlural: true,
    }),
    secret: c.env.BETTER_AUTH_SECRET,
    baseURL: c.env.BETTER_AUTH_BASE_URL,
    trustedOrigins: c.env.BETTER_AUTH_TRUSTED_ORIGINS.split(","),
    socialProviders: {
      github: {
        clientId: c.env.GITHUB_CLIENT_ID,
        clientSecret: c.env.GITHUB_CLIENT_SECRET,
      },
      google: {
        clientId: c.env.GOOGLE_CLIENT_ID,
        clientSecret: c.env.GOOGLE_CLIENT_SECRET,
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const database = db(c.env.DB);

            // Create default organization for new user
            const org = await database
              .insert(organizations)
              .values({
                name: user.name,
                slug: `${slugify(user.name, { lower: true })}-${createId().slice(0, 8)}`,
              })
              .returning()
              .get();

            // Add user as member of organization
            await database.insert(members).values({
              userId: user.id,
              organizationId: org.id,
              role: "owner",
            });

            // Create default project for new organization
            await database.insert(projects).values({
              name: "Default",
              organizationId: org.id,
              slug: "default",
            });

            // Set active organization for new user's session
            await database
              .update(sessions)
              .set({ activeOrganizationId: org.id })
              .where(eq(sessions.userId, user.id));

            // Send welcome email to new user
            try {
              await new Resend(c.env.RESEND_API_KEY).emails.send({
                from: "Languine <hello@emails.languine.ai>",
                to: user.email,
                subject: "Welcome to Languine",
                react: WelcomeEmail({ name: user.name }),
              });
            } catch (error) {
              console.error("Error sending welcome email", error);
            }
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const database = db(c.env.DB);

            const org = await database
              .select()
              .from(members)
              .where(eq(members.userId, session.userId))
              .leftJoin(
                organizations,
                eq(organizations.id, members.organizationId),
              )
              .limit(1)
              .get();

            return {
              data: {
                ...session,
                activeOrganizationId: "test",
              },
            };
          },
        },
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: !c.env.BETTER_AUTH_BASE_URL?.includes("localhost"),
        domain: ".languine.ai",
      },
    },
    plugins: [organization()],
  });
};
