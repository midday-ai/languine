import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "sandbox",
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/confirmation`,
});
