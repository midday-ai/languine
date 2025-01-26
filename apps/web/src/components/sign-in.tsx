"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function SignIn() {
  const t = useTranslations("header");

  return <Link href="/login">{t("signIn")}</Link>;
}
