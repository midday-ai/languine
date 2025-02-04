import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";
import { BillingPlan, BillingPlanSkeleton } from "../billing-plan";

export function BillingSettings() {
  const { organization } = useParams();

  const [data, { isPending }] = trpc.organization.getStats.useSuspenseQuery({
    organizationId: organization as string,
  });

  if (isPending) {
    return <BillingPlanSkeleton />;
  }

  return (
    <BillingPlan
      tier={data.tier}
      polarCustomerId={data.polarCustomerId}
      keysUsed={data.totalKeys}
      documentsUsed={data.totalDocuments}
      languagesUsed={data.totalLanguages}
      canceledAt={data.canceledAt}
    />
  );
}
