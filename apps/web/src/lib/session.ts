import { headers } from "next/headers";
import { auth } from "./auth";

export const getSession = async () => {
  const session = await auth.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  return session;
};
