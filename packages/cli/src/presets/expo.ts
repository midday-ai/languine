import { exec } from "node:child_process";
import fs from "node:fs/promises";
import { confirm, outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import dedent from "dedent";
import preferredPM from "preferred-pm";
import { simpleGit } from "simple-git";

const git = simpleGit();

export interface PresetOptions {
  sourceLanguage: string;
  targetLanguages: string[];
}

async function installDependencies() {
  const s = spinner();

  const shouldInstall = await confirm({
    message:
      "Would you like to install required dependencies (i18n-js, expo-localization)?",
  });

  if (!shouldInstall) {
    outro("Skipping dependency installation");
    return;
  }

  s.start("Installing dependencies...");
  try {
    const pm = await preferredPM(process.cwd());
    await new Promise<void>((resolve, reject) => {
      exec(`${pm?.name} install i18n-js`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    await new Promise<void>((resolve, reject) => {
      exec("npx expo install expo-localization", (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    s.stop("Dependencies installed successfully");
  } catch {
    s.stop("Failed to install dependencies");
    outro(
      `Problems? ${chalk.underline(chalk.cyan("https://go.midday.ai/wzhr9Gt"))}`,
    );

    process.exit(1);
  }
}

async function createExampleTranslationFile(
  language: string,
  isSource: boolean,
) {
  const content = {
    welcome: isSource ? "Welcome to my app" : `[${language}] Welcome to my app`,
    hello: isSource ? "Hello" : `[${language}] Hello`,
    settings: isSource ? "Settings" : `[${language}] Settings`,
  };

  await fs.writeFile(
    `locales/${language}.json`,
    JSON.stringify(content, null, 2),
  );

  // Create native translations for app metadata
  await fs.mkdir("locales/native", { recursive: true });
  const nativeContent = {
    CFBundleDisplayName: isSource ? "My App" : `My App (${language})`,
    NSContactsUsageDescription: isSource
      ? "We need access to contacts to help you connect with friends"
      : `[${language}] We need access to contacts to help you connect with friends`,
  };

  await fs.writeFile(
    `locales/native/${language}.json`,
    JSON.stringify(nativeContent, null, 2),
  );
}

async function createTypesFile() {
  const typesContent = dedent`
    // This file is auto-generated. Do not edit manually.
    export interface Translations {
      welcome: string;
      hello: string;
      settings: string;
    }

    declare module "*.json" {
      const content: Translations;
      export default content;
    }
  `;

  await fs.writeFile("locales/types.d.ts", typesContent);
}

async function createI18nFile(
  sourceLanguage: string,
  targetLanguages: string[],
) {
  const i18nContent = dedent`
    // For more information on Expo Localization and usage: https://docs.expo.dev/guides/localization
    import { getLocales } from 'expo-localization';
    import { I18n } from 'i18n-js';
    import type { Translations } from './types';
    
    const translations: Record<string, Translations> = {
      ${sourceLanguage}: require('./${sourceLanguage}.json'),
      ${targetLanguages.map((lang) => `${lang}: require('./${lang}.json')`).join(",\n      ")}
    }
    
    const i18n = new I18n(translations);
    
    // Set the locale once at the beginning of your app
    i18n.locale = getLocales().at(0)?.languageCode ?? '${sourceLanguage}';
    
    // When a value is missing from a language it'll fallback to another language with the key present
    i18n.enableFallback = true;
    
    export default i18n;
    export type { Translations };
  `;

  await fs.mkdir("locales", { recursive: true });
  await fs.writeFile("locales/i18n.ts", i18nContent);
}

async function createReadme() {
  const readmeContent = dedent`
    # Localization Setup

    This project uses Expo Localization for handling multiple languages.

    ## Structure

    - \`locales/i18n.ts\` - Main i18n configuration
    - \`locales/types.d.ts\` - TypeScript types for translations
    - \`locales/{lang}.json\` - Translation files for each language
    - \`locales/native/{lang}.json\` - Native app metadata translations

    ## Usage

    Import the i18n instance in your components:

    \`\`\`tsx
    import i18n from './locales/i18n';

    function MyComponent() {
      return <Text>{i18n.t('welcome')}</Text>;
    }
    \`\`\`

    ## Adding New Translations

    1. Add new keys to \`types.d.ts\`
    2. Add translations to each language file
    3. Run \`languine translate\` to update missing translations
  `;

  await fs.writeFile("locales/README.md", readmeContent);
}

export async function expo(options: PresetOptions) {
  // Check for uncommitted changes first
  try {
    const status = await git.status();
    if (!status.isClean()) {
      outro(
        "You have uncommitted changes. Please commit or stash them before proceeding.",
      );
      process.exit(1);
    }
  } catch (error) {
    outro("Failed to check git status. Make sure you are in a git repository.");
    process.exit(1);
  }

  const { sourceLanguage, targetLanguages } = options;
  const appJsonPath = "app.json";

  try {
    await fs.access(appJsonPath);
  } catch {
    outro(
      "app.json not found. Please make sure you're in an Expo project root directory.",
    );
    process.exit(1);
  }

  const appJson = JSON.parse(await fs.readFile(appJsonPath, "utf-8"));

  if (!appJson.expo.ios) {
    appJson.expo.ios = {};
  }
  if (!appJson.expo.ios.infoPlist) {
    appJson.expo.ios.infoPlist = {};
  }
  appJson.expo.ios.infoPlist.CFBundleAllowMixedLocalizations = true;

  if (!appJson.expo.plugins) {
    appJson.expo.plugins = [];
  }
  if (!appJson.expo.plugins.includes("expo-localization")) {
    appJson.expo.plugins.push("expo-localization");
  }

  // Add RTL support
  if (!appJson.expo.extra) {
    appJson.expo.extra = {};
  }
  appJson.expo.extra.supportsRTL = true;

  appJson.expo.locales = {
    [sourceLanguage]: `./locales/native/${sourceLanguage}.json`,
    ...Object.fromEntries(
      targetLanguages.map((lang: string) => [
        lang,
        `./locales/native/${lang}.json`,
      ]),
    ),
  };

  await fs.writeFile(appJsonPath, JSON.stringify(appJson, null, 2));

  await installDependencies();
  await createI18nFile(sourceLanguage, targetLanguages);
  await createTypesFile();
  await createReadme();

  // Create example translation files
  await createExampleTranslationFile(sourceLanguage, true);
  for (const lang of targetLanguages) {
    await createExampleTranslationFile(lang, false);
  }

  return {
    fileFormat: "json",
    filesPattern: ["locales/native/[locale].json", "locales/[locale].json"],
  };
}
