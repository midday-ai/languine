import { Companies } from "@/components/companies";
import { DottedSeparator } from "@/components/dotted-separator";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";

export default function Page() {
  return (
    <div>
      <Hero />

      <div className="space-y-16">
        <Companies />
        <DottedSeparator />
        <Features />
      </div>
    </div>
  );
}
