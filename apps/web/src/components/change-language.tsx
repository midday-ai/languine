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
      <DropdownMenuTrigger type="button" className="flex items-center gap-2">
        {currentLocale}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={10}>
        {locales.map((locale) => (
          // @ts-ignore
          <DropdownMenuItem key={locale} onClick={() => changeLocale(locale)}>
            {locale}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
