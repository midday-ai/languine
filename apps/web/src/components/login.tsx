"use client";

import { auth } from "@/lib/auth";
import { Button } from "./ui/button";

export default function Login() {
  const handleGithubLogin = async () => {
    await auth.signIn.social({
      provider: "github",
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <Button onClick={handleGithubLogin}>Sign in with GitHub</Button>
    </div>
  );
}
