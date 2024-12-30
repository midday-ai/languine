import type { Env } from "hono";

type Environment = Env & {
  Bindings: {
    DB: D1Database;
    ENV_TYPE: "dev" | "prod" | "stage";
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    AUTH_REDIRECT_URI: string;
  };
};
