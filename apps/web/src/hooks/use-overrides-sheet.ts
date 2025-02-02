import { parseAsString, useQueryStates } from "nuqs";

export function useOverridesSheet() {
  const [{ translationId, locale }, setQueryStates] = useQueryStates({
    translationId: parseAsString.withDefault(""),
    locale: parseAsString.withDefault(""),
  });

  return {
    translationId,
    locale,
    setQueryStates,
  };
}
