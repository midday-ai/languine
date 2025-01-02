import { createI18nServer } from "next-international/server";

export const { getI18n, getScopedI18n, getStaticParams } = createI18nServer({
  en: () => import("./en"),
  fr: () => import("./fr"),
  es: () => import("./es"),
  de: () => import("./de"),
  no: () => import("./no"),
  sv: () => import("./sv"),
  fi: () => import("./fi"),
  pt: () => import("./pt"),
  ar: () => import("./ar"),
  ja: () => import("./ja"),
  ko: () => import("./ko"),
});
