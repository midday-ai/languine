import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, magicLink, organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    usePlural: true,
  }),
  plugins: [
    bearer(),
    organization(),
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        // send email to user
      },
    }),
  ],
  //   socialProviders: {
  //     github: {
  //       clientId: process.env.GITHUB_CLIENT_ID!,
  //       clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //     },
  //   },
});
