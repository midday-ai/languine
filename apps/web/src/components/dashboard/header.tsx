import { ChangeLanguage } from "@/components/change-language";
import { TeamSelectorServer } from "@/components/team-selector.server";
import { UserMenu } from "@/components/user-menu";
import Link from "next/link";
import { MdOutlineBook } from "react-icons/md";

export function Header() {
  return (
    <div className="h-[70px] border-b w-full flex items-center px-4 sticky top-0 bg-background z-10 bg-noise">
      <div className="flex-1 flex justify-center">
        <TeamSelectorServer />
      </div>

      <div className="flex justify-end items-center">
        <div className="flex pr-4 space-x-8 items-center">
          <ChangeLanguage />

          <Link
            href="/docs"
            className="[&>svg]:size-5 size-[70px] flex items-center justify-center border-l border-r border-border"
          >
            <MdOutlineBook />
          </Link>
        </div>

        <UserMenu />
      </div>
    </div>
  );
}
