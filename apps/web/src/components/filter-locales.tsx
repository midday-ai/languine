"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFilters } from "@/hooks/use-filters";
import { useTranslations } from "next-intl";
import * as React from "react";
import { MdOutlineFilterList } from "react-icons/md";

export function FilterLocales({ locales }: { locales: string[] }) {
  const t = useTranslations("filter_locales");
  const { selectedLocales, setSelectedLocales } = useFilters();

  function getLanguageName(locale: string) {
    try {
      const displayNames = new Intl.DisplayNames(["en"], { type: "language" });
      const languageCode = locale.split("-")[0];
      return displayNames.of(languageCode) || locale;
    } catch (error) {
      return locale;
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="size-10">
          <MdOutlineFilterList />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 py-2">
        {locales.map((locale) => (
          <DropdownMenuCheckboxItem
            className="text-xs"
            key={locale}
            checked={selectedLocales.includes(locale)}
            onCheckedChange={(checked) =>
              setSelectedLocales(
                checked
                  ? [...selectedLocales, locale]
                  : selectedLocales.filter((l) => l !== locale),
              )
            }
          >
            {getLanguageName(locale)} [{locale}]
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
