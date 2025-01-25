import { connectDb } from "@/db";
import { getOrganizationLimits } from "@/db/queries/organization";
import type { organizations } from "@/db/schema";
import { projects } from "@/db/schema";
import { TIERS_MAX_DOCUMENTS, TIERS_MAX_KEYS } from "@/lib/tiers";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type { jobsSchema } from "./schema";

export interface TranslationLimitCheckResult {
  meta: {
    plan: string;
    tier: string;
    organizationId: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface TranslationTaskOptions {
  queue: {
    name: string;
    concurrencyLimit: number;
  };
  concurrencyKey: string;
}

export async function getProjectOrganization(projectId: string) {
  const db = await connectDb();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      organization: true,
    },
  });

  if (!project?.organization) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }

  return project.organization;
}

export async function checkTranslationLimits(
  org: typeof organizations.$inferSelect,
  input: typeof jobsSchema._type,
): Promise<TranslationLimitCheckResult | null> {
  const { totalKeys, totalDocuments } = await getOrganizationLimits(org.id);

  const nextTotalDocuments = totalDocuments + 1 * input.targetLanguages.length;
  const currentDocumentsLimit =
    TIERS_MAX_DOCUMENTS[org.tier as keyof typeof TIERS_MAX_DOCUMENTS];

  if (nextTotalDocuments >= currentDocumentsLimit) {
    return {
      meta: {
        plan: org.plan,
        tier: String(org.tier),
        organizationId: org.id,
      },
      error: {
        code: "DOCUMENT_LIMIT_REACHED",
        message: "You have reached the maximum number of documents",
      },
    };
  }

  const nextTotalKeys =
    totalKeys + input.content.length * input.targetLanguages.length;
  const currentKeysLimit =
    TIERS_MAX_KEYS[org.tier as keyof typeof TIERS_MAX_KEYS];

  if (nextTotalKeys >= currentKeysLimit) {
    return {
      meta: {
        plan: org.plan,
        tier: String(org.tier),
        organizationId: org.id,
      },
      error: {
        code: "KEY_LIMIT_REACHED",
        message: "You have reached the maximum number of keys",
      },
    };
  }

  return {
    meta: {
      plan: org.plan,
      tier: String(org.tier),
      organizationId: org.id,
    },
  };
}

export function getTranslationTaskOptions(
  org: typeof organizations.$inferSelect,
) {
  const isFreeUser = org.plan === "free";

  const options: TranslationTaskOptions = isFreeUser
    ? {
        queue: {
          name: "free-users",
          concurrencyLimit: 1,
        },
        concurrencyKey: "free-users",
      }
    : {
        queue: {
          name: "paid-users",
          concurrencyLimit: 5,
        },
        concurrencyKey: org.id,
      };

  return {
    options,
    isFreeUser,
  };
}
