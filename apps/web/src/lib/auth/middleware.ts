import type { Session, User } from "better-auth";
import { headers } from "next/headers";
import { cache } from "react";

type SessionData = {
  user: User;
  session: Session & { activeOrganizationId: string };
};

export const getSessionFromRequest = cache(
  async (): Promise<SessionData | null> => {
    return await fetch(
      `${process.env.BETTER_AUTH_BASE_URL}/api/auth/get-session`,
      {
        headers: {
          cookie: (await headers()).get("cookie") || "",
        },
      },
    ).then(async (res) => {
      if (!res.ok) return null;

      return res.json();
    });
  },
);
