"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default function GithubSignIn() {
  const handleGithubLogin = async () => {
    await auth.signIn.social({
      provider: "github",
      callbackURL: `${window.location.origin}/login`,
    });
  };

  return <Button onClick={handleGithubLogin}>Sign in with GitHub</Button>;
}
