"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlanModal } from "@/hooks/use-plan-modal";
import { buildCheckoutURL } from "@/lib/checkout";
import { trpc } from "@/trpc/client";
import { useTranslations } from "next-intl";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PricingSlider } from "../pricing-slider";
import { SubmitButton } from "../ui/submit-button";

export function ChangePlanModal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("changePlan");
  const { organization } = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data } = trpc.organization.getById.useQuery(
    {
      organizationId: organization as string,
    },
    {
      enabled: !!organization,
    },
  );

  const { open, setQueryStates, tier } = usePlanModal();
  const minTier = data?.tier + 1;

  const handleUpgrade = () => {
    setIsSubmitting(true);
    const url = buildCheckoutURL({
      tier: tier ?? 1,
      pathname,
      organizationId: organization as string,
      customerData: data,
    });

    router.push(url);
  };

  return (
    <Dialog open={open} onOpenChange={() => setQueryStates(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-normal">{t("title")}</DialogTitle>
        </DialogHeader>
        <p className="text-secondary text-xs">{t("description")}</p>

        <div className="h-[230px] flex justify-end flex-col">
          <PricingSlider
            value={tier}
            min={minTier}
            setValue={(value: number) => {
              setQueryStates({ tier: value });
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setQueryStates(null)}>
            {t("cancel")}
          </Button>

          <SubmitButton
            isSubmitting={isSubmitting}
            variant="default"
            onClick={handleUpgrade}
          >
            {t("upgrade_to_tier", { tier: tier })}
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
