import fs from "node:fs/promises";
import path from "node:path";
import { execAsync } from "@/utils/exec.ts";
import { confirm, outro, spinner } from "@clack/prompts";
import dedent from "dedent";
import preferredPM from "preferred-pm";
import { simpleGit } from "simple-git";

const git = simpleGit();

export interface PresetOptions {
  sourceLanguage: string;
  targetLanguages: string[];
}

async function findRootPackageJson(startDir: string): Promise<string | null> {
  let currentDir = startDir;
  let rootDir: string | null = null;

  while (currentDir !== path.parse(currentDir).root) {
    try {
      const packageJsonPath = path.join(currentDir, "package.json");
      await fs.access(packageJsonPath);
      rootDir = currentDir;
      // Don't return immediately, keep going up to find the highest package.json
      currentDir = path.dirname(currentDir);
    } catch {
      currentDir = path.dirname(currentDir);
    }
  }

  return rootDir;
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
    const rootDir = await findRootPackageJson(process.cwd());
    if (!rootDir) {
      throw new Error("Could not find a package.json in any parent directory");
    }

    const pm = await preferredPM(rootDir);
    if (!pm) {
      throw new Error("No package manager detected");
    }

    await execAsync(`${pm.name} install i18n-js`);
    await execAsync("bunx expo install expo-localization");

    s.stop("Dependencies installed successfully");
  } catch (error) {
    console.error(error);
    s.stop("Failed to install dependencies");

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

async function createI18nFile(
  sourceLanguage: string,
  targetLanguages: string[],
) {
  const i18nContent = dedent`
    // For more information on Expo Localization and usage: https://docs.expo.dev/guides/localization
    import { getLocales } from 'expo-localization';
    import { I18n } from 'i18n-js';
    
    const translations = {
      ${sourceLanguage}: require('./${sourceLanguage}.json'),
      ${targetLanguages.map((lang) => `${lang}: require('./${lang}.json')`).join(",\n      ")}
    }
    
    const i18n = new I18n(translations);
    
    // Set the locale once at the beginning of your app
    i18n.locale = getLocales().at(0)?.languageCode ?? '${sourceLanguage}';
    
    // When a value is missing from a language it'll fallback to another language with the key present
    i18n.enableFallback = true;
    
    export default i18n;
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

    1. Add translations to each language file
    2. Run \`languine translate\` to start translating
  `;

  await fs.writeFile("locales/README.md", readmeContent);
}

export async function expo(options: PresetOptions) {
  //   Check for uncommitted changes first
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

  if (!appJson.expo.extra) {
    appJson.expo.extra = {};
  }

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
