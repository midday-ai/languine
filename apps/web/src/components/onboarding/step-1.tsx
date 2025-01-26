"use client";

import { CopyInput } from "@/components/copy-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { parseAsInteger } from "nuqs";
import { useQueryState } from "nuqs";

export default function Step1({ projectId }: { projectId: string }) {
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
  const t = useTranslations("onboarding");

  return (
    <div>
      <Card
        className={cn(
          "overflow-hidden bg-transparent transition-opacity duration-300 border-dashed cursor-pointer",
          step < 1 ? "opacity-50" : "opacity-100 border-primary",
        )}
        onClick={() => setStep(1)}
      >
        <CardHeader className="py-4">
          <CardTitle className="text-sm">1. {t("steps.1.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-secondary">{t("steps.1.description")}</p>
          <CopyInput
            value={`npx languine@latest init --p=${projectId}`}
            onCopy={() => setStep(2)}
            className="border-dashed !text-xs"
          />
        </CardContent>
      </Card>

      <div
        className={cn(
          "w-[1px] h-8 border-l border-dashed mx-auto z-0",
          step >= 2 ? "border-primary" : "border-border",
        )}
      />
    </div>
  );
}
