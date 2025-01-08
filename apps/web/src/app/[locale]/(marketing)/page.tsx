import { Companies } from "@/components/companies";
import { DottedSeparator } from "@/components/dotted-separator";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { Info } from "@/components/info";
import { Pipeline } from "@/components/pipeline";
import { getI18n } from "@/locales/server";

export async function generateMetadata() {
  const t = await getI18n();

  return {
    title: `Languine - ${t("hero.title")}`,
    description: t("hero.description"),
  };
}

export default function Page() {
  return (
    <div>
      <Hero />

      <div className="space-y-16 max-w-screen-lg mx-auto">
        <Companies />
        <DottedSeparator />
        <Features />
        <Info />
        <DottedSeparator />
        <Pipeline />
      </div>
    </div>
  );
}
