import { Activity } from "@/components/activity";
import { getI18n } from "@/locales/server";

export async function ActivityServer() {
  const t = await getI18n();

  return (
    <div className="p-8">
      <h2 className="text-lg font-normal">{t("activity.title")}</h2>

      <Activity />
    </div>
  );
}
