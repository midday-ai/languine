"use client";

import Link from "next/link";
import { MdOutlineBook, MdOutlineSettings } from "react-icons/md";
import { SignOut } from "../sign-out";
import SelectOrganization from "./select-organization";

export function Header() {
  return (
    <div className="h-[70px] border-b w-full flex items-center px-4">
      <div className="flex-1 flex justify-center">
        <SelectOrganization />
      </div>

      <div className="flex justify-end items-center">
        <div className="flex pr-4">
          <Link
            href="/docs"
            className="[&>svg]:size-5 size-[70px] flex items-center justify-center border-l border-r border-border"
          >
            <MdOutlineBook />
          </Link>
        </div>

        <SignOut />
      </div>
    </div>
  );
}
