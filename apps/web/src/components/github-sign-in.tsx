"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Github } from "lucide-react";

export default function GithubSignIn() {
  const handleGithubLogin = async () => {
    await auth.signIn.social({
      provider: "github",
      callbackURL: `${window.location.origin}/login`,
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleGithubLogin}
      className="flex items-center gap-2"
    >
      <Github className="h-4 w-4" />
      Sign in with GitHub
    </Button>
  );
}
