"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import languineConfig from "../../languine.json";

export function ChangeLanguage() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const locales = [
    languineConfig.locale.source,
    ...languineConfig.locale.targets,
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className="items-center gap-2 text-secondary outline-none uppercase text-xs font-medium hidden md:flex"
      >
        [{locale}]
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="max-h-[300px] overflow-y-auto"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => router.replace(pathname, { locale: loc })}
            className="uppercase text-xs"
          >
            {t(loc)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
