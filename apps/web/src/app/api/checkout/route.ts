import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.POLAR_ENVIRONMENT! as "sandbox" | "production",
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/confirmation`,
});
