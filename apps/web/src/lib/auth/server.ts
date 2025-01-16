import { db } from "@/db";
import * as schema from "@/db/schema";
import InviteEmail from "@/emails/templates/invite";
import { resend } from "@/lib/resend";
import { getAppUrl } from "@/lib/url";
import { waitUntil } from "@vercel/functions";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { databaseHooks } from "./hooks";
import { secondaryStorage } from "./storage";

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
  secondaryStorage,
  databaseHooks,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${getAppUrl()}/api/invite/${data.id}`;

        try {
          waitUntil(
            resend.emails.send({
              from: "Languine <hello@emails.languine.ai>",
              to: data.email,
              subject: `You've been invited to join ${data.organization.name} on Languine`,
              react: InviteEmail({
                invitedByUsername: data.inviter.user.name,
                invitedByEmail: data.inviter.user.email,
                teamName: data.organization.name,
                inviteLink,
              }),
            }),
          );
        } catch (error) {
          console.error("Error sending welcome email", error);
        }
      },
    }),
  ],
});
