"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

function getCookie(name: string) {
  const cookies = document?.cookie.split("; ");
  const cookie = cookies?.find((row) => row.includes(name));
  return cookie ? cookie.split("=")[1] : null;
}

export function SignIn() {
  const t = useTranslations("header");
  const authToken = getCookie("auth-token");

  return <Link href="/login">{authToken ? t("goToApp") : t("signIn")}</Link>;
}
