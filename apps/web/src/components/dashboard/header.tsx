"use client";

import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleSignOut = async () => {
    console.log("signing out");
    await auth.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <button type="button" onClick={handleSignOut}>
      Sign out
    </button>
  );
}
