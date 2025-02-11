// For more information on Expo Localization and usage: https://docs.expo.dev/guides/localization
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: require('./en.json'),
  es: require('./es.json'),
  sv: require('./sv.json')
}

const i18n = new I18n(translations);

// Set the locale once at the beginning of your app
i18n.locale = getLocales().at(0)?.languageCode ?? 'en';

// When a value is missing from a language it'll fallback to another language with the key present
i18n.enableFallback = true;

export default i18n;