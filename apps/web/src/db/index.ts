import { withReplicas } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import { headers } from "next/headers";
import * as schema from "./schema";

export const primaryDb = drizzle(process.env.DATABASE_PRIMARY_URL!, { schema });

const usReplica = drizzle(process.env.DATABASE_US_URL!, {
  schema,
});

const euReplica = drizzle(process.env.DATABASE_EU_URL!, {
  schema,
});

const auReplica = drizzle(process.env.DATABASE_AU_URL!, {
  schema,
});

export const connectDb = async () => {
  const headerList = await headers();
  const region = headerList.get("x-vercel-ip-country") || "EU";

  return withReplicas(
    primaryDb,
    [usReplica, euReplica, auReplica],
    (replicas) => {
      // Use US DB for North/South America
      const americasRegions = ["US", "CA", "MX", "BR", "AR", "CO", "PE", "CL"];
      if (americasRegions.includes(region)) {
        return replicas[0]!;
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
        return replicas[2]!;
      }

      // Default to EU DB for rest of world
      return replicas[1]!;
    },
  );
};
