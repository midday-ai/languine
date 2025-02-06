import { SupportForm } from "@/components/support-form";
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("support");

  return (
    <div className="flex flex-col px-4 md:px-8">
      <h1 className="text-lg p-8 pl-0 pt-6 font-normal font-mono">
        {t("title")}
      </h1>

      <div className="w-full max-w-2xl">
        <SupportForm />
      </div>
    </div>
  );
}
