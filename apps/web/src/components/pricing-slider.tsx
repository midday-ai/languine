import { Slider } from "@/components/ui/slider";
import NumberFlow from "@number-flow/react";

export function PricingSlider({
  value,
  setValue,
}: { value: number[]; setValue: (value: number[]) => void }) {
  const getKeysForPrice = (price: number) => {
    if (price <= 49) return 2000;

    const tiers = Math.floor((price - 49) / 49);

    if (getKeysForPrice(49 + (tiers - 1) * 49) <= 50000) {
      return 2000 + tiers * 4000;
    }

    const tiersTo50k = 12;
    const remainingTiers = tiers - tiersTo50k;
    return 50000 + remainingTiers * 8000;
  };

  const getMaxPrice = () => {
    let price = 49;
    while (getKeysForPrice(price) < 250000) {
      price += 49;
    }
    return price;
  };

  const maxPrice = getMaxPrice();

  return (
    <div className="mt-8">
      <div className="relative mb-6">
        <div
          className="absolute -top-12 left-0 transform -translate-x-1/2 bg-background font-medium text-primary text-[11px] px-3 py-1 rounded-full border border-border text-center whitespace-nowrap"
          style={{ left: `${(value[0] / maxPrice) * 100}%` }}
        >
          {Math.floor(getKeysForPrice(value[0]) / 1000)}k keys
        </div>
        <Slider
          value={value}
          onValueChange={(newValue) =>
            setValue(newValue.map((v) => Math.max(49, v)))
          }
          step={49}
          min={0}
          max={maxPrice}
        />
      </div>
      <NumberFlow
        value={value[0]}
        defaultValue={49}
        className="font-mono text-2xl"
        locales="en-US"
        format={{
          style: "currency",
          currency: "USD",
          trailingZeroDisplay: "stripIfInteger",
        }}
        suffix="/mon"
      />
    </div>
  );
}
