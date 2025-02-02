"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/use-search";
import { useTranslations } from "next-intl";
import { MdClose, MdSearch } from "react-icons/md";

export function SearchInput() {
  const t = useTranslations("search");
  const { search, setSearch } = useSearch();

  return (
    <div className="relative w-full">
      <MdSearch className="absolute left-3 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={t("placeholder")}
        value={search ?? ""}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setSearch("");
          }
        }}
        className="pl-9 pr-9"
      />
      {search && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-transparent"
          onClick={() => setSearch("")}
        >
          <MdClose className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
