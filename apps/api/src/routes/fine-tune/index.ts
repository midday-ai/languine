import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { bodySchema, responseSchema } from "./schema";

const app = new Hono();

app.post(
  "/",
  describeRoute({
    description: "Fine tune a model",
    responses: {
      200: {
        description: "Successful fine tune response",
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
    return c.json({ data: "Fine tuned model!" });
  },
);

export default app;
