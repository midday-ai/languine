"use client";

import { CopyInput } from "@/components/copy-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { parseAsInteger } from "nuqs";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

export default function Step2() {
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
  const t = useTranslations("onboarding");
  const { organization, project } = useParams();
  const router = useRouter();

  const { data, isRefetching } = trpc.analytics.getProjectStats.useQuery(
    {
      projectSlug: project as string,
      organizationId: organization as string,
      period: "daily",
    },
    {
      enabled: !!organization && !!project,
      refetchInterval: 5000,
    },
  );

  useEffect(() => {
    if (data && data.totalKeys > 0) {
      router.refresh();
    }
  }, [data, isRefetching]);

  return (
    <Card
      className={cn(
        "overflow-hidden bg-transparent transition-opacity duration-300 border-dashed cursor-pointer",
        step < 2 ? "opacity-50" : "opacity-100 border-primary",
      )}
      onClick={() => setStep(2)}
    >
      <CardHeader className="py-4">
        <CardTitle className="text-sm">2. {t("steps.2.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className=" flex items-center gap-1.5">
          {step === 2 && <Loader />}

          <p className="text-xs text-secondar">{t("steps.2.description")}</p>
        </div>
        <CopyInput
          value="npx languine@latest translate"
          className="border-dashed !text-xs"
        />
      </CardContent>
    </Card>
  );
}
