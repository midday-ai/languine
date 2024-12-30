import { Hono as Base } from "hono";
import type { Environment } from "../bindings.d.ts";

export const Hono = Base<Environment>;
