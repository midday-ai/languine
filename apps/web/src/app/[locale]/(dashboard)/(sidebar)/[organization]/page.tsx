import { TranslationsChart } from "@/components/charts/translations";
import { Feed } from "@/components/feed";

export default function Page() {
  return (
    <div>
      <TranslationsChart />

      <div className="h-10 mt-10 w-full bg-dotted" />

      <Feed />
    </div>
  );
}
