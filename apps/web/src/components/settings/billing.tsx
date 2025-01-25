"use client";

import { useTranslations } from "next-intl";

export function BillingSettings() {
  const t = useTranslations("billing");

  return <div>{t("title")}</div>;
}
