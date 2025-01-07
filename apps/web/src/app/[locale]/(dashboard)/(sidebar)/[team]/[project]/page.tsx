import { Activity } from "@/components/activity";
import { TranslationsChart } from "@/components/charts/translations";

export default function Page() {
  return (
    <div>
      <TranslationsChart />

      <div className="h-10 mt-10 w-full bg-dotted" />

      <Activity />
    </div>
  );
}
