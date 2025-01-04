"use client";

import { auth } from "@/lib/auth";
import { useI18n } from "@/locales/client";
import Link from "next/link";

export function SignIn() {
  const t = useI18n();
  const { data: session } = auth.useSession();

  return (
    <Link href="/login" className="text-primary">
      {session ? t("header.goToApp") : t("header.signIn")}
    </Link>
  );
}
