"use client";

import { authClient } from "@/lib/auth/client";
import { useI18n } from "@/locales/client";
import Link from "next/link";

export function SignIn() {
  const t = useI18n();
  const { data: session } = authClient.useSession();

  return (
    <Link href="/login">
      {session ? t("header.goToApp") : t("header.signIn")}
    </Link>
  );
}
