"use client";

import { authClient } from "@/lib/auth";

export default function Login() {
  const handleLogin = async () => {
    await authClient.emailOtp.sendVerificationOtp({
      email: "pontus@languine.ai",
      type: "sign-in",
    });
  };

  return (
    <button onClick={handleLogin} type="button">
      Login
    </button>
  );
}
