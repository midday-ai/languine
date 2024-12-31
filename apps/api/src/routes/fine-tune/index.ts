import { Hono } from "@/lib/app";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { fineTuneBodySchema, fineTuneResponseSchema } from "./schema";

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
            schema: resolver(fineTuneResponseSchema),
          },
        },
      },
    },
  }),
  zValidator("json", fineTuneBodySchema),
  (c) => {
    return c.json({ data: "Fine tuned model!" });
  },
);

export default app;
