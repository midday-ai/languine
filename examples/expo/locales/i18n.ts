// For more information on Expo Localization and usage: https://docs.expo.dev/guides/localization
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: require('./en.json'),
  es: require('./es.json')
}

const i18n = new I18n(translations);

i18n.locale = getLocales().at(0)?.languageCode ?? 'en';

i18n.enableFallback = true;

export default i18n;