"use client";

import { SignOut } from "../sign-out";
import SelectOrganization from "./select-organization";

export function Header() {
  return (
    <div className="h-[70px] border-b w-full flex items-center px-4">
      <div className="flex-1 flex justify-center">
        <SelectOrganization />
      </div>
      <div className="flex justify-end">
        <SignOut />
      </div>
    </div>
  );
}
