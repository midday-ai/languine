import { Slider } from "@/components/ui/slider";
import { TIERS_MAX_DOCUMENTS, TIERS_MAX_KEYS, TIER_PRICES } from "@/lib/tiers";
import NumberFlow from "@number-flow/react";
import { useTranslations } from "next-intl";

export function PricingSlider({
  value,
  setValue,
}: { value: number[]; setValue: (value: number[]) => void }) {
  const t = useTranslations("pricing_slider");

  const getPriceForStep = (step: number) => {
    return (
      TIER_PRICES[(step + 1) as keyof typeof TIER_PRICES] || TIER_PRICES[1]
    );
  };

  const getStepForPrice = (price: number) => {
    const tier = Number(
      Object.entries(TIER_PRICES).find(([_, p]) => p === price)?.[0] || 1,
    );
    return tier - 1;
  };

  const getKeysForPrice = (price: number) => {
    const tier = Object.entries(TIER_PRICES).find(([_, p]) => p === price)?.[0];
    return tier
      ? TIERS_MAX_KEYS[Number(tier) as keyof typeof TIERS_MAX_KEYS]
      : TIERS_MAX_KEYS[1];
  };

  const getTierNumber = (price: number) => {
    return (
      Object.entries(TIER_PRICES).find(([_, p]) => p === price)?.[0] || "1"
    );
  };

  const getDocumentsForPrice = (price: number) => {
    const tier = Object.entries(TIER_PRICES).find(([_, p]) => p === price)?.[0];
    return tier
      ? TIERS_MAX_DOCUMENTS[Number(tier) as keyof typeof TIERS_MAX_DOCUMENTS]
      : TIERS_MAX_DOCUMENTS[1];
  };

  const handleValueChange = (newValue: number[]) => {
    setValue([getPriceForStep(Math.round(newValue[0]))]);
  };

  return (
    <div className="mt-8 ml-[100px]">
      <div className="relative mb-6">
        <div
          className="bg-[#1D1D1D] absolute -top-[105px] transform -translate-x-1/2 font-medium text-primary whitespace-nowrap flex flex-col gap-1 text-xs w-[210px]"
          style={{
            left: `${(getStepForPrice(value[0]) / 7) * 100}%`,
          }}
        >
          <div className="border-b border-background p-2 uppercase">
            {t("tier", { tier: getTierNumber(value[0]) })}
          </div>

          <div className="text-xs flex items-center justify-between px-2 py-1">
            <span className="text-primary">
              {getKeysForPrice(value[0]).toLocaleString()}
            </span>
            <span className="text-secondary">{t("keys")}</span>
          </div>

          <div className="text-xs flex items-center justify-between px-2 pb-2">
            <span className="text-primary">
              {getDocumentsForPrice(value[0]).toLocaleString()}
            </span>
            <span className="text-secondary">{t("documents")}</span>
          </div>
        </div>

        <div className="flex">
          <div className="w-[100px] -ml-[100px] h-1.5 bg-white" />
          <Slider
            value={[getStepForPrice(value[0])]}
            onValueChange={handleValueChange}
            step={1}
            min={0}
            max={7}
          />
        </div>
      </div>

      <NumberFlow
        value={value[0]}
        defaultValue={49}
        className="font-mono text-2xl -ml-[100px]"
        locales="en-US"
        format={{
          style: "currency",
          currency: "USD",
          trailingZeroDisplay: "stripIfInteger",
        }}
        suffix={`/${t("period")}`}
      />
    </div>
  );
}
