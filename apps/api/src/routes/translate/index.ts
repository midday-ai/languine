import { Hono } from "@/lib/app";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import {
  batchTextSchema,
  chatSchema,
  objectSchema,
  recognizeSchema,
  textSchema,
} from "./schema";

const app = new Hono();

app.post(
  "/text",
  describeRoute({
    description: "Translate text to target language",
    responses: {
      200: {
        description: "Successfully translated text",
        content: {
          "application/json": {
            schema: resolver(textSchema),
          },
        },
      },
    },
  }),
  zValidator("json", textSchema),
  async (c) => {
    const { text, sourceLocale, targetLocale } = await c.req.json();
    return c.json({ data: text }); // Placeholder response
  },
);

app.post(
  "/text/batch",
  describeRoute({
    description: "Translate text to multiple target languages",
    responses: {
      200: {
        description: "Successfully translated text to multiple languages",
        content: {
          "application/json": {
            schema: resolver(batchTextSchema),
          },
        },
      },
    },
  }),
  zValidator("json", batchTextSchema),
  async (c) => {
    const { text, sourceLocale, targetLocales, fast } = await c.req.json();
    return c.json({ data: [text] }); // Placeholder response
  },
);

app.post(
  "/object",
  describeRoute({
    description: "Translate object values to target language",
    responses: {
      200: {
        description: "Successfully translated object",
        content: {
          "application/json": {
            schema: resolver(objectSchema),
          },
        },
      },
    },
  }),
  zValidator("json", objectSchema),
  async (c) => {
    const { content, sourceLocale, targetLocale } = await c.req.json();
    return c.json({ data: content }); // Placeholder response
  },
);

app.post(
  "/chat",
  describeRoute({
    description: "Translate chat messages to target language",
    responses: {
      200: {
        description: "Successfully translated chat messages",
        content: {
          "application/json": {
            schema: resolver(chatSchema),
          },
        },
      },
    },
  }),
  zValidator("json", chatSchema),
  async (c) => {
    const { messages, sourceLocale, targetLocale } = await c.req.json();
    return c.json({ data: messages }); // Placeholder response
  },
);

app.post(
  "/recognize",
  describeRoute({
    description: "Recognize the locale of provided text",
    responses: {
      200: {
        description: "Successfully recognized locale",
        content: {
          "application/json": {
            schema: resolver(recognizeSchema),
          },
        },
      },
    },
  }),
  zValidator("json", recognizeSchema),
  async (c) => {
    const { text } = await c.req.json();
    return c.json({ data: "en" }); // Placeholder response
  },
);

export default app;
