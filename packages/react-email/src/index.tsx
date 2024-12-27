import { join } from "node:path";
import { I18n } from "i18n-js";

export function withI18n<Props extends object>(
  Component: React.ComponentType<Props>,
  locale: string,
) {
  const WithI18nComponent = (props: Props) => {
    // Read and parse i18n config file
    const configPath = join(process.cwd(), "locales/i18n.config.ts");
    const config = require(configPath);

    if (!config) {
      throw new Error("i18n.config.ts not found");
    }

    const i18n = new I18n(config);

    i18n.locale = locale;
    i18n.enableFallback = true;

    return <Component {...props} locale={locale} i18n={i18n} />;
  };

  WithI18nComponent.displayName = `withI18n(${
    Component.displayName || Component.name || "Component"
  })`;

  return WithI18nComponent;
}
