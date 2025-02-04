import { withReplicas } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import { headers } from "next/headers";
import postgres from "postgres";
import * as schema from "./schema";

// Create connection pools that can be reused
const primaryPool = postgres(process.env.DATABASE_PRIMARY_URL!, {
  prepare: false,
});

const usPool = postgres(process.env.DATABASE_US_URL!, {
  prepare: false,
});

const euPool = postgres(process.env.DATABASE_EU_URL!, {
  prepare: false,
});

const auPool = postgres(process.env.DATABASE_AU_URL!, {
  prepare: false,
});

const primaryDb = drizzle(primaryPool, { schema });
const usReplica = drizzle(usPool, { schema });
const euReplica = drizzle(euPool, { schema });
const auReplica = drizzle(auPool, { schema });

// Global db instance that will be reused
let db: ReturnType<typeof withReplicas>;

const getReplicaForRegion = (region: string) => {
  // Use US DB for North/South America
  const americasRegions = ["US", "CA", "MX", "BR", "AR", "CO", "PE", "CL"];
  if (americasRegions.includes(region)) {
    return 0; // Index for US replica
  }

  // Use AU DB for Oceania/Asia Pacific
  const oceaniaRegions = [
    "AU",
    "NZ",
    "JP",
    "KR",
    "SG",
    "ID",
    "MY",
    "TH",
    "VN",
    "PH",
  ];
  if (oceaniaRegions.includes(region)) {
    return 2; // Index for AU replica
  }

  return 1; // Default to EU replica
};

const initDb = async () => {
  if (db) return db;

  let region = "EU";

  try {
    // Get region from headers, defaulting to EU if not available
    const headerList = await headers();
    region = (headerList.get("x-vercel-ip-country") as string) || "EU";
  } catch {
    // If we can't access headers (e.g., during build), default to EU
  }

  const replicaIndex = getReplicaForRegion(region);

  db = withReplicas(
    primaryDb,
    [usReplica, euReplica, auReplica],
    (replicas) => replicas[replicaIndex]!,
  );

  return db;
};

export const connectDb = async () => {
  return await initDb();
};
