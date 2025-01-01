import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

const translations = {
  en: (await import("@/content/app.json")).default,
  cn: (await import("@/content/app.cn.json")).default,
} as const;

export const baseOptions = (locale: "en" | "cn") => {
  return {
    nav: {
      title: translations[locale].title,
    },
    i18n: true,
  } satisfies BaseLayoutProps;
};
