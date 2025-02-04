"use client";

import { usePlanModal } from "@/hooks/use-plan-modal";
import {
  TIERS_MAX_DOCUMENTS,
  TIERS_MAX_KEYS,
  TIER_MAX_LANGUAGES,
} from "@/lib/tiers";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function CurrentTier({ tier }: { tier: number }) {
  const t = useTranslations("current_tier");
  const { setQueryStates } = usePlanModal();

  const maxKeys = TIERS_MAX_KEYS[tier as keyof typeof TIERS_MAX_KEYS];
  const maxDocuments =
    TIERS_MAX_DOCUMENTS[tier as keyof typeof TIERS_MAX_DOCUMENTS];
  const maxLanguages =
    TIER_MAX_LANGUAGES[tier as keyof typeof TIER_MAX_LANGUAGES];

  return (
    <div>
      {t("currentTier")}

      <Card className="bg-transparent mt-6">
        <CardHeader>
          <CardTitle className="text-sm font-normal">
            {tier > 0 ? `${t("tier")} ${tier}` : t("free")}
          </CardTitle>
          <CardDescription>
            {maxKeys.toLocaleString()} {t("translationKeys")},{" "}
            {maxDocuments.toLocaleString()} {t("documents")}, {maxLanguages}{" "}
            {t("languages")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            variant="outline"
            onClick={() =>
              setQueryStates({ modal: "plan", tier: Math.min(tier + 1, 8) })
            }
          >
            {t("changePlan")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
