"use client";

import { useI18n } from "@/locales/client";

export function BillingSettings() {
  const t = useI18n();

  return <div>{t("billing.title")}</div>;
}
