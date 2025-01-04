"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth";
import { useI18n } from "@/locales/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { data: session } = auth.useSession();
  const t = useI18n();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-1">
        <Avatar className="size-6">
          {session?.user?.image ? (
            <AvatarImage
              src={session.user.image}
              alt={session.user.name ?? ""}
            />
          ) : (
            <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-secondary">
        <div className="flex flex-col gap-1 p-2">
          <span className="text-sm text-primary">{session?.user?.name}</span>
          <span className="text-xs">{session?.user?.email}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/account">{t("userMenu.account")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/tuning">{t("userMenu.createTeam")}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/">{t("userMenu.homepage")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          {t("userMenu.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
