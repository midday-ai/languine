import type { auth } from "@/auth";
import type { Env } from "hono";

type Environment = Env & {
  Bindings: {
    DB: D1Database;
    ENV_TYPE: "dev" | "prod" | "stage";
    RESEND_API_KEY: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_TRUSTED_ORIGINS: string;
  };
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};
