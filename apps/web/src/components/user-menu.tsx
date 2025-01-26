"use client";

import { signOut } from "@/actions/sign-out";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/contexts/session";
import { useCreateTeamModal } from "@/hooks/use-create-team-modal";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export function UserMenu() {
  const t = useTranslations("userMenu");
  const { session } = useSession();
  const { setOpen: openCreateTeamModal } = useCreateTeamModal();
  const params = useParams();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-6">
          {session?.user?.user_metadata?.avatar_url ? (
            <Image
              src={session.user.user_metadata.avatar_url}
              alt={session.user.user_metadata.full_name ?? ""}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <AvatarFallback className="text-[10px]">
              {session?.user?.user_metadata?.full_name?.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-secondary">
        <div className="flex flex-col gap-1 p-2">
          <span className="text-sm text-primary">
            {session?.user?.user_metadata?.full_name}
          </span>
          <span className="text-xs">{session?.user?.email}</span>
        </div>
        <DropdownMenuSeparator />
        <Link
          href={`/${params.organization}/${params.project}/settings?tab=account`}
        >
          <DropdownMenuItem className="text-sm">
            {t("account")}
          </DropdownMenuItem>
        </Link>
        <Link
          href={`/${params.organization}/${params.project}/settings?tab=team`}
          className="cursor-pointer"
        >
          <DropdownMenuItem className="text-sm">{t("team")}</DropdownMenuItem>
        </Link>
        <button
          type="button"
          onClick={() => openCreateTeamModal(true)}
          className="cursor-pointer text-xs w-full"
        >
          <DropdownMenuItem className="text-sm">
            {t("createTeam")}
          </DropdownMenuItem>
        </button>
        <DropdownMenuSeparator />
        <Link href="/">
          <DropdownMenuItem className="text-sm">
            {t("homepage")}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={handleSignOut} className="text-sm">
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
