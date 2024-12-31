import { Hono as Base } from "hono";
import type { Environment } from "../bindings.js";

export const Hono = Base<Environment>;
