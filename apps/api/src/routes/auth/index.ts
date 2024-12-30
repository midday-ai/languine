import { auth } from "@/auth";
import { Hono } from "@/libs/app";

const app = new Hono();

app.on(["POST", "GET"], "/**", (c) => auth.handler(c.req.raw));

export default app;
