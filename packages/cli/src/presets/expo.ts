import { exec } from "node:child_process";
import fs from "node:fs/promises";
import { confirm, outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import dedent from "dedent";
import preferredPM from "preferred-pm";
import type { PresetOptions } from "../types.js";

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
    
    i18n.locale = getLocales().at(0)?.languageCode ?? '${sourceLanguage}';
    
    i18n.enableFallback = true;
    
    export default i18n;
  `;

  await fs.mkdir("locales", { recursive: true });
  await fs.writeFile("locales/i18n.ts", i18nContent);
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

export async function expo(options: PresetOptions) {
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

  appJson.expo.locales = {
    [sourceLanguage]: `./locales/native/${sourceLanguage}.json`,
    ...Object.fromEntries(
      targetLanguages.map((lang) => [lang, `./locales/native/${lang}.json`]),
    ),
  };

  await fs.writeFile(appJsonPath, JSON.stringify(appJson, null, 2));

  await installDependencies();
  await createI18nFile(sourceLanguage, targetLanguages);

  return {
    fileFormat: "json",
    filesPattern: ["locales/native/[locale].json", "locales/[locale].json"],
  };
}
