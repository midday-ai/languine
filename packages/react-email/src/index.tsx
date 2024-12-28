import { I18n } from "i18n-js";
import { interpolate } from "./interpolate";
import { translations } from "./loader";

export function setupI18n(locale?: string) {
  if (Object.keys(translations).length === 0) {
    throw new Error(
      "No translation files found in locales directory, make sure it's in the root of the package",
    );
  }

  const i18n = new I18n(translations);

  // Set locale to first available locale if no locale is provided
  i18n.locale = locale || Object.keys(translations).at(0) || "en";
  i18n.enableFallback = true;
  // @ts-ignore
  i18n.interpolate = interpolate;

  return i18n;
}
