import { Activity } from "@/components/activity";
import { AnalyticsChart } from "@/components/charts/analytics";

export default function Page() {
  return (
    <div>
      <AnalyticsChart />

      <div className="h-10 mt-10 w-full bg-dotted" />

      <Activity />
    </div>
  );
}
