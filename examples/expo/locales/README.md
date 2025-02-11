# Localization Setup

This project uses Expo Localization for handling multiple languages.

## Structure

- `locales/i18n.ts` - Main i18n configuration
- `locales/{lang}.json` - Translation files for each language
- `locales/native/{lang}.json` - Native app metadata translations

## Usage

Import the i18n instance in your components:

```tsx
import i18n from './locales/i18n';

function MyComponent() {
  return <Text>{i18n.t('welcome')}</Text>;
}
```

## Adding New Translations

1. Add translations to each language file
2. Run `languine translate` to start translating