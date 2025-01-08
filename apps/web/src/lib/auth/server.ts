import { db } from "@/db";
import { createDefaultOrganization } from "@/db/queries/insert";
import { getDefaultOrganization } from "@/db/queries/select";
import * as schema from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    usePlural: true,
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const org = await createDefaultOrganization(user);

          // // Send welcome email to new user
          // try {
          //   await new Resend(c.env.RESEND_API_KEY).emails.send({
          //     from: "Languine <hello@emails.languine.ai>",
          //     to: user.email,
          //     subject: "Welcome to Languine",
          //     react: WelcomeEmail({ name: user.name }),
          //   });
          // } catch (error) {
          //   console.error("Error sending welcome email", error);
          // }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const org = await getDefaultOrganization(session.userId);

          return {
            data: {
              ...session,
              activeOrganizationId: org?.organizations?.id,
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
  plugins: [organization()],
});
