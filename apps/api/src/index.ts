import { Hono } from "@/lib/app";
import { setupAuth } from "@/lib/auth";
import { apiReference } from "@scalar/hono-api-reference";
import { openAPISpecs } from "hono-openapi";
import { cors } from "hono/cors";
import { sessionMiddleware } from "./middleware";
import feedbackRouter from "./routes/feedback";
import fineTuneRouter from "./routes/fine-tune";
import projectsRouter from "./routes/projects";
import teamsRouter from "./routes/teams";
import telemetryRouter from "./routes/telemetry";
import translateRouter from "./routes/translate";
import usersRouter from "./routes/users";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://languine.ai"],
    allowHeaders: ["Content-Type", "Authorization", "credentials"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return setupAuth(c).handler(c.req.raw);
});

app.use("*", sessionMiddleware);

const appRoutes = app
  .route("/telemetry", telemetryRouter)
  .route("/fine-tune", fineTuneRouter)
  .route("/feedback", feedbackRouter)
  .route("/translate", translateRouter)
  .route("/users", usersRouter)
  .route("/projects", projectsRouter)
  .route("/teams", teamsRouter);

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Languine API",
        version: "1.0.0",
        description: "API for Languine",
      },
      servers: [
        {
          url: "http://localhost:3002",
          description: "Local server",
        },
        {
          url: "https://api.languine.ai",
          description: "Production server",
        },
      ],
    },
  }),
);

app.get(
  "/",
  apiReference({
    theme: "saturn",
    spec: { url: "/openapi" },
  }),
);

export type AppType = typeof appRoutes;

export default app;
