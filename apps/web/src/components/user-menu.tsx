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
import { useParams, useRouter } from "next/navigation";

export function UserMenu() {
  const { data: session } = auth.useSession();
  const params = useParams();
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
        <Link href={`/${params.team}/${params.project}/settings?tab=account`}>
          <DropdownMenuItem className="text-sm">
            {t("userMenu.account")}
          </DropdownMenuItem>
        </Link>
        <Link
          href={`/${params.team}/${params.project}/settings?tab=team`}
          className="cursor-pointer"
        >
          <DropdownMenuItem className="text-sm">
            {t("userMenu.team")}
          </DropdownMenuItem>
        </Link>
        <Link href="/tuning" className="cursor-pointer text-xs">
          <DropdownMenuItem className="text-sm">
            {t("userMenu.createTeam")}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/">
          <DropdownMenuItem className="text-sm">
            {t("userMenu.homepage")}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={handleSignOut} className="text-sm">
          {t("userMenu.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
