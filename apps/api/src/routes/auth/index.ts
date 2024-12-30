import { githubAuth } from "@hono/oauth-providers/github";
import { googleAuth } from "@hono/oauth-providers/google";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { authResponseSchema } from "./schema";

type Bindings = {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  AUTH_REDIRECT_URI: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/github", (c, next) => {
  githubAuth({
    client_id: c.env.GITHUB_CLIENT_ID,
    client_secret: c.env.GITHUB_CLIENT_SECRET,
  });

  return next();
});

app.get(
  "/github",
  describeRoute({
    description: "Handle GitHub OAuth authentication",
    responses: {
      200: {
        description: "Successfully authenticated with GitHub",
        content: {
          "application/json": {
            schema: resolver(authResponseSchema),
          },
        },
      },
      401: {
        description: "Authentication failed",
        content: {
          "application/json": {
            schema: resolver(authResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const token = c.get("token");
    const profile = c.get("user-github");

    if (!token || !profile) {
      return c.json({ error: "Failed to authenticate with GitHub" }, 401);
    }

    return c.json({
      data: {
        token,
        user: {
          email: profile.email,
          name: profile.name,
          provider: "github",
        },
      },
    });
  },
);

app.use("/google", (c, next) => {
  googleAuth({
    client_id: c.env.GOOGLE_CLIENT_ID,
    client_secret: c.env.GOOGLE_CLIENT_SECRET,
    scope: ["openid", "email", "profile"],
  });

  return next();
});

app.get(
  "/google",
  describeRoute({
    description: "Handle Google OAuth authentication",
    responses: {
      200: {
        description: "Successfully authenticated with Google",
        content: {
          "application/json": {
            schema: resolver(authResponseSchema),
          },
        },
      },
      401: {
        description: "Authentication failed",
        content: {
          "application/json": {
            schema: resolver(authResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const token = c.get("token");
    const profile = c.get("user-google");

    if (!token || !profile) {
      return c.json({ error: "Failed to authenticate with Google" }, 401);
    }

    return c.json({
      data: {
        token,
        user: {
          email: profile.email,
          name: profile.name,
          provider: "google",
        },
      },
    });
  },
);

app.post(
  "/token",
  describeRoute({
    description: "Exchange OAuth token for user info",
    responses: {
      200: {
        description: "Successfully exchanged token",
        content: {
          "application/json": {
            schema: resolver(authResponseSchema),
          },
        },
      },
      401: {
        description: "Invalid token",
        content: {
          "application/json": {
            schema: resolver(authResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      // TODO: Implement token verification and user info retrieval
      // This would involve:
      // 1. Verifying the token's validity
      // 2. Fetching associated user information
      // 3. Returning the user data in the same format as the OAuth endpoints

      return c.json({
        data: {
          token,
          user: {
            // User data would be populated from token verification
            email: "",
            name: "",
            provider: "github", // or "google" depending on token
          },
        },
      });
    } catch (error) {
      return c.json({ error: "Invalid token" }, 401);
    }
  },
);

app.post(
  "/revalidate",
  describeRoute({
    description: "Revalidate an existing auth token",
    responses: {
      200: {
        description: "Successfully revalidated token",
        content: {
          "application/json": {
            schema: resolver(authResponseSchema),
          },
        },
      },
      401: {
        description: "Invalid or expired token",
        content: {
          "application/json": {
            schema: resolver(authResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      // TODO: Implement token revalidation logic
      // This would involve:
      // 1. Verifying the token hasn't expired
      // 2. Checking if the token is still valid
      // 3. Optionally refreshing the token if needed
      // 4. Returning updated token and user info

      return c.json({
        data: {
          token,
          user: {
            // User data would be populated from token verification
            email: "",
            name: "",
            provider: "github", // or "google" depending on token
          },
        },
      });
    } catch (error) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }
  },
);

export default app;
