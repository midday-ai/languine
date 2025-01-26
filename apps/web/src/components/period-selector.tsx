"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { usePeriod } from "@/hooks/use-period";
import { periods } from "@/hooks/use-period";
import { useTranslations } from "next-intl";

export function PeriodSelector() {
  const { period, setPeriod } = usePeriod();
  const t = useTranslations("periods");

  return (
    <Select value={period} onValueChange={setPeriod}>
      <SelectTrigger className="w-[120px] text-xs h-auto flex-1 space-x-1">
        <span className="line-clamp-1">{t(period)}</span>
      </SelectTrigger>
      <SelectContent>
        {periods.map((period) => (
          <SelectItem key={period} value={period} className="text-xs">
            {t(period)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
