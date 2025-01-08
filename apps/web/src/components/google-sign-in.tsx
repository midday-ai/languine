"use client";

import { OutlinedButton } from "@/components/ui/outlined-button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/client";
import { useI18n } from "@/locales/client";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

export default function GoogleSignIn() {
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    console.log("Google login", window.location.origin);

    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/login`,
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <OutlinedButton
      variant="secondary"
      onClick={handleGoogleLogin}
      className="w-full text-center sm:w-auto flex items-center gap-2"
    >
      <div className="flex items-center gap-2 w-full justify-center sm:w-auto sm:justify-start">
        {isLoading ? <Spinner size="sm" /> : <FaGoogle className="h-4 w-4" />}
        {t("login.google")}
      </div>
    </OutlinedButton>
  );
}
