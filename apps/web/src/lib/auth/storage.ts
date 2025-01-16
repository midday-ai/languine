import { kv } from "@/lib/kv";

export const secondaryStorage = {
  get: async (key: string) => {
    try {
      const value = await kv.get(key);
      if (value === null) return null;
      return typeof value === "string" ? value : JSON.stringify(value);
    } catch (error) {
      console.error("Failed to get from Redis:", error);
      return null;
    }
  },
  set: async (key: string, value: string, ttl?: number) => {
    try {
      JSON.parse(value);
      const options = ttl ? { ex: ttl } : undefined;
      await kv.set(key, value, options);
    } catch (error) {
      console.error("Failed to set in Redis:", error);
    }
  },
  delete: async (key: string) => {
    try {
      await kv.del(key);
    } catch (error) {
      console.error("Failed to delete from Redis:", error);
    }
  },
};
