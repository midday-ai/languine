"use client";

import { useTranslations } from "next-intl";
import { PlanSettings } from "../plan-settings";

export function BillingSettings() {
  const t = useTranslations("billing");

  return (
    <div>
      <div>
        <PlanSettings
          tier={1}
          keysUsed={1000}
          documentsUsed={10}
          languagesUsed={10}
        />
      </div>
    </div>
  );
}
