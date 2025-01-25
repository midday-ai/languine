"use client";

// import { useSession } from "@/contexts/session";
import { useI18n } from "@/locales/client";
import Link from "next/link";

export function SignIn() {
  const t = useI18n();
  // const { session } = useSession();

  return (
    <Link href="/login">
      {t("header.signIn")}
      {/* {session ? t("header.goToApp") : t("header.signIn")} */}
    </Link>
  );
}
