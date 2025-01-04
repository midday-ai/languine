"use client";

import { OutlinedButton } from "@/components/ui/outlined-button";
import { auth } from "@/lib/auth";
import { useI18n } from "@/locales/client";
import { FaGoogle } from "react-icons/fa";

export default function GoogleSignIn() {
  const t = useI18n();

  const handleGoogleLogin = async () => {
    await auth.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/login`,
    });
  };

  return (
    <OutlinedButton
      variant="secondary"
      onClick={handleGoogleLogin}
      className="flex items-center gap-2"
    >
      <FaGoogle className="h-4 w-4" />
      {t("login.google")}
    </OutlinedButton>
  );
}
