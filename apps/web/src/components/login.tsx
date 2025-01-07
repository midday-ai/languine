import { getI18n } from "@/locales/server";
import Link from "next/link";
import GithubSignIn from "./github-sign-in";
import GoogleSignIn from "./google-sign-in";

export default async function Login() {
  const t = await getI18n();

  return (
    <div className="flex flex-col gap-4 px-4">
      <h2 className="text-2xl font-normal">{t("login.title")}</h2>
      <p className="text-secondary">{t("login.description")}</p>
      <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
        <GithubSignIn />
        <GoogleSignIn />
      </div>

      <div className="absolute bottom-12 max-w-xl px-4">
        <div className="bg-dotted mb-6 h-9 w-full" />
        <p className="text-secondary text-sm">
          {t("login.terms.text")}{" "}
          <Link href="/terms" className="text-primary underline">
            {t("login.terms.termsOfService")}
          </Link>{" "}
          {t("login.terms.and")}{" "}
          <Link href="/policy" className="text-primary underline">
            {t("login.terms.privacyPolicy")}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}