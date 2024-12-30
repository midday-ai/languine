import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import router from "./routes";

const app = new Hono();

app.route("/", router);

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

export default app;
