"use client";

import { useI18n } from "@/locales/client";

export function Info() {
  const t = useI18n();

  return (
    <div className="flex flex-col space-y-12">
      <div>
        {t("info.title")}
        <ul className="text-secondary mt-4">
          ◇ Extracting translation keys
          <li>◇ Automatic translations to chosen languages</li>
          <li>◇ Handles new and updated keys</li>
          <li>
            ◇ Support for every major file format including JSON, TypeScript,
            Markdown + 12 more
          </li>
          <li>◇ Fine-tuning for tonality</li>
        </ul>
      </div>

      <div>
        {t("info.title")}
        <ul className="text-secondary mt-4">
          ◇ Extracting translation keys
          <li>◇ Automatic translations to chosen languages</li>
          <li>◇ Handles new and updated keys</li>
          <li>
            ◇ Support for every major file format including JSON, TypeScript,
            Markdown + 12 more
          </li>
          <li>◇ Fine-tuning for tonality</li>
        </ul>
      </div>

      <div>
        {t("info.title")}
        <ul className="text-secondary mt-4">
          ◇ Extracting translation keys
          <li>◇ Automatic translations to chosen languages</li>
          <li>◇ Handles new and updated keys</li>
          <li>
            ◇ Support for every major file format including JSON, TypeScript,
            Markdown + 12 more
          </li>
          <li>◇ Fine-tuning for tonality</li>
        </ul>
      </div>
    </div>
  );
}
