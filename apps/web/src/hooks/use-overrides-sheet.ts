import { parseAsString, useQueryStates } from "nuqs";

export function useOverridesSheet() {
  const [{ translationKey, projectId, locale }, setQueryStates] =
    useQueryStates({
      translationKey: parseAsString.withDefault(""),
      projectId: parseAsString.withDefault(""),
      locale: parseAsString.withDefault(""),
    });

  return {
    translationKey,
    projectId,
    locale,
    setQueryStates,
  };
}
