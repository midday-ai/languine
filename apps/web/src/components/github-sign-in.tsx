"use client";

import { OutlinedButton } from "@/components/ui/outlined-button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/client";
import { useI18n } from "@/locales/client";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

export default function GithubSignIn() {
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
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
      onClick={handleGithubLogin}
      className="flex items-center gap-2"
    >
      <div className="flex items-center gap-2">
        {isLoading ? <Spinner size="sm" /> : <FaGithub className="h-4 w-4" />}

        {t("login.github")}
      </div>
    </OutlinedButton>
  );
}
