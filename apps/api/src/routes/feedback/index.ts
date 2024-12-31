import { Hono } from "@/lib/app";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { bodySchema, responseSchema } from "./schema";

const app = new Hono();

app.post(
  "/",
  describeRoute({
    description: "Submit feedback",
    responses: {
      200: {
        description: "Successful feedback submission",
        content: {
          "application/json": {
            schema: resolver(responseSchema),
          },
        },
      },
    },
  }),
  zValidator("json", bodySchema),
  (c) => {
    return c.json({ data: "Feedback received!" });
  },
);

export default app;
