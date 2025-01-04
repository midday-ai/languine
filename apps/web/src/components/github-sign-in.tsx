"use client";

import { OutlinedButton } from "@/components/ui/outlined-button";
import { auth } from "@/lib/auth";
import { useI18n } from "@/locales/client";
import { FaGithub } from "react-icons/fa";

export default function GithubSignIn() {
  const t = useI18n();

  const handleGithubLogin = async () => {
    await auth.signIn.social({
      provider: "github",
      callbackURL: `${window.location.origin}/login`,
    });
  };

  return (
    <OutlinedButton
      variant="secondary"
      onClick={handleGithubLogin}
      className="flex items-center gap-2"
    >
      <FaGithub className="h-4 w-4" />
      {t("login.github")}
    </OutlinedButton>
  );
}
