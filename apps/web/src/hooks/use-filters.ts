import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";

export function useFilters() {
  const [{ locales }, setQueryStates] = useQueryStates({
    locales: parseAsArrayOf(parseAsString).withDefault([]),
  });

  const setSelectedLocales = (newLocales: string[]) => {
    setQueryStates({ locales: newLocales.length ? newLocales : null });
  };

  return {
    selectedLocales: locales,
    setSelectedLocales,
  };
}
