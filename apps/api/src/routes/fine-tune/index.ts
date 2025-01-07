import { Hono } from "@/lib/app";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { fineTuneBodySchema, fineTuneResponseSchema } from "./schema";

const app = new Hono()
  .post(
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
  )
  .get(
    "/:id",
    describeRoute({
      description: "Get fine tune status",
      responses: {
        200: {
          description: "Successfully retrieved fine tune status",
          content: {
            "application/json": {
              schema: resolver(fineTuneResponseSchema),
            },
          },
        },
        404: {
          description: "Fine tune not found",
          content: {
            "application/json": {
              schema: resolver(fineTuneResponseSchema),
            },
          },
        },
      },
    }),
    async (c) => {
      const id = c.req.param("id");
      return c.json({ data: `Fine tune ${id} status` });
    },
  );

export default app;
