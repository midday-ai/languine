import { ChangeLanguage } from "@/components/change-language";
import { MobileMenu } from "@/components/dashboard/mobile-menu";
import { Logo } from "@/components/logo-square";
import { TeamSelectorServer } from "@/components/team-selector.server";
import { UserMenu } from "@/components/user-menu";
import Link from "next/link";
import { MdOutlineBook } from "react-icons/md";

export function Header() {
  return (
    <div className="h-[70px] border-b w-full flex items-center md:px-4 sticky top-0 bg-background z-10 bg-noise">
      <div className="flex md:hidden border-r border-border h-full items-center justify-center size-[70px]">
        <Logo />
      </div>

      <div className="flex-1 flex justify-center">
        <TeamSelectorServer />
      </div>

      <div className="flex justify-end items-center">
        <div className="flex pr-4 space-x-8 items-center">
          <ChangeLanguage />

          <Link
            href="/docs"
            className="[&>svg]:size-5 size-[70px] hidden md:flex items-center justify-center border-l border-r border-border "
          >
            <MdOutlineBook />
          </Link>
        </div>

        <div className="hidden md:flex">
          <UserMenu />
        </div>
      </div>

      <div className="flex md:hidden border-l border-border h-full items-center justify-center size-[70px]">
        <MobileMenu />
      </div>
    </div>
  );
}
