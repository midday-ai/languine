"use client";

import { authClient } from "@/lib/auth";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { InputOTPGroup } from "./ui/input-otp";
import { InputOTP } from "./ui/input-otp";
import { InputOTPSlot } from "./ui/input-otp";

export default function Login() {
  const handleLogin = async () => {
    await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
  };

  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="mb-4">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      {!showOTP ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleLogin();
            setShowOTP(true);
          }}
        >
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit">Send code</Button>
        </form>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await authClient.signIn.emailOtp({
              email,
              otp,
            });
          }}
        >
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button type="submit">Sign in</Button>
        </form>
      )}
    </div>
  );
}
