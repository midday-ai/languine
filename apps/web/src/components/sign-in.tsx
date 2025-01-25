"use client";

import { Link } from "@/i18n/routing";
// import { useSession } from "@/contexts/session";
import { useTranslations } from "next-intl";

export function SignIn() {
  const t = useTranslations("header");
  // const { session } = useSession();

  return (
    <Link href="/login">
      {t("signIn")}
      {/* {session ? t("goToApp") : t("signIn")} */}
    </Link>
  );
}
