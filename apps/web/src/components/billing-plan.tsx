import { CurrentTier } from "@/components/current-tier";
import { PlanSettings } from "@/components/plan-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  tier: number;
  keysUsed: number;
  documentsUsed: number;
  languagesUsed: number;
  polarCustomerId?: string;
  canceledAt?: string | null;
};

export function BillingPlan({
  tier,
  keysUsed,
  documentsUsed,
  languagesUsed,
  polarCustomerId,
  canceledAt,
}: Props) {
  return (
    <div className="space-y-10">
      <PlanSettings
        tier={tier}
        keysUsed={keysUsed}
        documentsUsed={documentsUsed}
        languagesUsed={languagesUsed}
      />

      <CurrentTier
        tier={tier}
        polarCustomerId={polarCustomerId}
        canceledAt={canceledAt}
      />
    </div>
  );
}

export function BillingPlanSkeleton() {
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i.toString()} className="bg-transparent">
            <CardHeader>
              <CardTitle className="text-sm font-normal">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-3 w-32 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Skeleton className="h-4 w-32 mb-6" />
        <Card className="bg-transparent">
          <CardHeader>
            <CardTitle className="text-sm font-normal">
              <Skeleton className="h-4 w-24" />
            </CardTitle>
            <Skeleton className="h-3 w-64 mt-1" />
          </CardHeader>
          <CardContent className="flex gap-4">
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
