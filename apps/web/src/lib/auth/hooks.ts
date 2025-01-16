import {
  createDefaultOrganization,
  getDefaultOrganization,
} from "@/db/queries/organization";
import WelcomeEmail from "@/emails/templates/welcome";
import { resend } from "@/lib/resend";
import { waitUntil } from "@vercel/functions";
import type { Session, User } from "better-auth";
import { cookies } from "next/headers";
import { CLI_TOKEN_NAME, saveCLISession } from "./cli";

export const databaseHooks = {
  user: {
    create: {
      after: async (user: User) => {
        await createDefaultOrganization(user);

        // Send welcome email to new user
        try {
          waitUntil(
            resend.emails.send({
              from: "Languine <hello@emails.languine.ai>",
              to: user.email,
              subject: "Welcome to Languine",
              react: WelcomeEmail({ name: user.name }),
            }),
          );
        } catch (error) {
          console.error("Error sending welcome email", error);
        }
      },
    },
  },
  session: {
    create: {
      before: async (session: Session) => {
        const org = await getDefaultOrganization(session.userId);

        const cookieStore = await cookies();
        const token = cookieStore.get(CLI_TOKEN_NAME);

        if (token?.value) {
          await saveCLISession(session, token.value);

          cookieStore.delete(CLI_TOKEN_NAME);
        }

        return {
          data: {
            ...session,
            activeOrganizationId: org?.organizations?.id,
          },
        };
      },
    },
  },
};
