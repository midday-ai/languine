"use client";

import { auth } from "@/lib/auth";
import { CopyInstall } from "./copy-install";
import { Button } from "./ui/button";

export default function Login() {
  const handleGithubLogin = async () => {
    await auth.signIn.social({
      provider: "github",
      callbackURL: "http://localhost:3002/api/auth/callback/github",
    });
  };

  return (
    <div className="text-center">
      Reach out to{" "}
      <a href="https://x.com/languine_ai" className="underline">
        @languine_ai
      </a>{" "}
      to request early access to the platform.
      <CopyInstall />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <Button onClick={handleGithubLogin}>Sign in with GitHub</Button>
    </div>
  );
}
