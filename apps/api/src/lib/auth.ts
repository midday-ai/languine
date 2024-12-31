import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, emailOTP, organization } from "better-auth/plugins";
// import { resend } from "./resend";
import type { Context } from "hono";

export const setupAuth = (c: Context) => {
  return betterAuth({
    database: drizzleAdapter(db(c.env.DB), {
      provider: "sqlite",
      usePlural: true,
    }),
    secret: c.env.BETTER_AUTH_SECRET,
    trustedOrigins: c.env.BETTER_AUTH_TRUSTED_ORIGINS.split(","),
    secondaryStorage: {
      get: (key) => c.env.KV.getItemRaw(`_auth:${key}`),
      set: (key, value, ttl) => {
        return c.env.KV.set(`_auth:${key}`, value, { ttl });
      },
      delete: (key) => c.env.KV.del(`_auth:${key}`),
    },
    plugins: [
      bearer(),
      organization(),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          console.log(email, otp, type);
          // Implement the sendVerificationOTP method to send the OTP to the user's email address
          // await resend.emails.send({
          //   from: "onboarding@resend.dev",
          //   to: email,
          //   subject: "Hello World",
          //   html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
          // });
        },
      }),
    ],
  });
};
