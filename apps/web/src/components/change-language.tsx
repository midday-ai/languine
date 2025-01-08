"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChangeLocale, useCurrentLocale } from "@/locales/client";
import languineConfig from "../../languine.config";

export function ChangeLanguage() {
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();

  const locales = [
    languineConfig.locale.source,
    ...languineConfig.locale.targets,
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className="flex items-center gap-2 text-secondary outline-none uppercase text-xs font-medium"
      >
        [{currentLocale}]
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="max-h-[300px] overflow-y-auto"
      >
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            // @ts-ignore
            onClick={() => changeLocale(locale)}
            className="uppercase text-xs"
          >
            {locale}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
