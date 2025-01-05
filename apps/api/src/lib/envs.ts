import type { Environment } from "@/bindings";
import { getContext } from "hono/context-storage";

export const getEnvs = () => {
  return getContext<Environment>();
};

export function getAppUrl() {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return "https://languine.ai";
}
