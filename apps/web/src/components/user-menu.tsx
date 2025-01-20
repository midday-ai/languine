"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateTeamModal } from "@/hooks/use-create-team-modal";
import { authClient } from "@/lib/auth/client";
import { useI18n } from "@/locales/client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export function UserMenu() {
  const { data: session } = authClient.useSession();
  const { setOpen: openCreateTeamModal } = useCreateTeamModal();
  const params = useParams();
  const t = useI18n();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
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
            <AvatarFallback className="text-[10px]">
              {session?.user?.name?.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-secondary">
        <div className="flex flex-col gap-1 p-2">
          <span className="text-sm text-primary">{session?.user?.name}</span>
          <span className="text-xs">{session?.user?.email}</span>
        </div>
        <DropdownMenuSeparator />
        <Link
          href={`/${params.organization}/${params.project}/settings?tab=account`}
        >
          <DropdownMenuItem className="text-sm">
            {t("userMenu.account")}
          </DropdownMenuItem>
        </Link>
        <Link
          href={`/${params.organization}/${params.project}/settings?tab=team`}
          className="cursor-pointer"
        >
          <DropdownMenuItem className="text-sm">
            {t("userMenu.team")}
          </DropdownMenuItem>
        </Link>
        <button
          type="button"
          onClick={() => openCreateTeamModal(true)}
          className="cursor-pointer text-xs w-full"
        >
          <DropdownMenuItem className="text-sm">
            {t("userMenu.createTeam")}
          </DropdownMenuItem>
        </button>
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
