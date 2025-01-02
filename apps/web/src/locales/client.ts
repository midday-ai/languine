"use client";

import { createI18nClient } from "next-international/client";

export const {
  useI18n,
  useScopedI18n,
  I18nProviderClient,
  useChangeLocale,
  useCurrentLocale,
} = createI18nClient({
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
