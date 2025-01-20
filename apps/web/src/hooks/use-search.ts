import { useQueryState } from "nuqs";
import { useCallback } from "react";

export function useSearch() {
  const [search, setSearch] = useQueryState("q");

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value || null);
    },
    [setSearch],
  );

  return {
    search: search || null,
    setSearch: handleSearch,
  };
}
