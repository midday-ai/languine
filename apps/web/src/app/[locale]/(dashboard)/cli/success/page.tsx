import { getSession } from "@/lib/session";
import { getI18n } from "@/locales/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const t = await getI18n();
  const session = await getSession();

  if (!session.data) {
    redirect("/login");
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <h1 className="text-xl font-medium mb-4">{t("cli.success.title")}</h1>
      <p className="text-center mb-2 text-sm text-secondary">
        {t("cli.success.description")} <span>{session.data.user.email}</span>
      </p>
      <p className="text-sm text-secondary">{t("cli.success.description_2")}</p>
    </div>
  );
}
