import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback } from "react";

export const periods = ["daily", "weekly", "monthly"] as const;
export type Period = (typeof periods)[number];

export function usePeriod() {
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsStringLiteral(periods).withDefault("daily"),
  );

  const handlePeriodChange = useCallback(
    (value: Period) => {
      setPeriod(value || "daily");
    },
    [setPeriod],
  );

  return {
    period: period || "daily",
    setPeriod: handlePeriodChange,
  };
}
