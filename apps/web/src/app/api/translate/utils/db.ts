import { connectDb } from "@/db";
import { getOrganizationLimits } from "@/db/queries/organization";
import { organizations, projects } from "@/db/schema";
import { TIERS_MAX_DOCUMENTS, TIERS_MAX_KEYS } from "@/lib/tiers";
import { eq } from "drizzle-orm";

export const verifyApiKeyAndLimits = async (
  apiKey: string,
  projectId: string,
  format?: string,
) => {
  if (!apiKey.startsWith("org_")) {
    throw new Error("Invalid API key format");
  }

  const db = await connectDb();

  // Optimize: Single query to get both organization and project
  const [org, project] = await Promise.all([
    db
      .select()
      .from(organizations)
      .where(eq(organizations.apiKey, apiKey))
      .limit(1)
      .then((rows) => rows[0]),
    db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)
      .then((rows) => rows[0]),
  ]);

  if (!org) throw new Error("Invalid API key");
  if (!project || project.organizationId !== org.id)
    throw new Error("Project not found or access denied");

  // Check translation limits
  const { totalKeys, totalDocuments } = await getOrganizationLimits(org.id);
  const currentKeysLimit =
    TIERS_MAX_KEYS[org.tier as keyof typeof TIERS_MAX_KEYS];
  const currentDocsLimit =
    TIERS_MAX_DOCUMENTS[org.tier as keyof typeof TIERS_MAX_DOCUMENTS];

  const isDocument = format === "md" || format === "mdx";
  if (isDocument && totalDocuments >= currentDocsLimit) {
    throw new Error("Document limit reached");
  }

  if (!isDocument && totalKeys >= currentKeysLimit) {
    throw new Error("Translation key limit reached");
  }

  return org;
};
