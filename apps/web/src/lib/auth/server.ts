import { db } from "@/db";
import {
  createDefaultOrganization,
  getDefaultOrganization,
} from "@/db/queries/organization";
import * as schema from "@/db/schema";
import InviteEmail from "@/emails/templates/invite";
import WelcomeEmail from "@/emails/templates/welcome";
import { resend } from "@/lib/resend";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { getAppUrl } from "../url";

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
          await createDefaultOrganization(user);

          // Send welcome email to new user
          try {
            await resend.emails.send({
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
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${getAppUrl()}/accept-invitation/${data.id}`;

        try {
          await resend.emails.send({
            from: "Languine <hello@emails.languine.ai>",
            to: data.email,
            subject: `You've been invited to join ${data.organization.name} on Languine`,
            react: InviteEmail({
              invitedByUsername: data.inviter.user.name,
              invitedByEmail: data.inviter.user.email,
              teamName: data.organization.name,
              inviteLink,
            }),
          });
        } catch (error) {
          console.error("Error sending welcome email", error);
        }
      },
    }),
  ],
});
