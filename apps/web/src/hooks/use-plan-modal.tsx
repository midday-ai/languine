import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export function usePlanModal() {
  const [{ tier, modal }, setQueryStates] = useQueryStates({
    tier: parseAsInteger.withDefault(0),
    modal: parseAsString.withDefault(""),
  });

  return {
    tier,
    open: modal === "plan",
    setQueryStates,
  };
}
