import { createHash } from "node:crypto";
import { kv } from "@/lib/kv";

// Cache TTL in seconds (8 hours)
export const CACHE_TTL = 60 * 60 * 8;

export const generateKey = (content: string): string => {
  return `api_${createHash("sha256").update(content).digest("hex").slice(0, 8)}`;
};

export const getCacheKey = (
  projectId: string,
  sourceLocale: string,
  targetLocale: string,
  key: string,
): string => {
  return `translate:${projectId}:${sourceLocale}:${targetLocale}:${key}`;
};

export const getFromCache = async (
  cacheKey: string,
): Promise<string | null> => {
  return kv.get<string>(cacheKey);
};

export const setInCache = async (
  cacheKey: string,
  value: string,
  ttl: number = CACHE_TTL,
): Promise<void> => {
  await kv.set(cacheKey, value, { ex: ttl });
};
