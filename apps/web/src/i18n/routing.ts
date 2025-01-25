import languineConfig from "languine.config";
import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [...languineConfig.locale.targets, languineConfig.locale.source],
  defaultLocale: languineConfig.locale.source,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
