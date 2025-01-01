import FastGlob from "fast-glob";
import type { Config } from "./types.js";

export interface Task {
  sourcePath: string;
  targetPath: string;
  format: string;
  locale: string;
}

/**
 * Resolve translations tasks based on config
 */
export async function resolveTasks(
  config: Config,
  targetLocale?: string,
): Promise<Task[]> {
  const tasks: Task[] = [];
  const locales = targetLocale ? [targetLocale] : config.locale.targets;

  for (const locale of locales) {
    for (const [format, { include, filter }] of Object.entries(config.files)) {
      for (const pattern of include) {
        if (typeof pattern === "string") {
          const sourcePath = pattern.replace("[locale]", config.locale.source);
          if (filter && !filter(sourcePath)) continue;

          const targetPath = pattern.replace("[locale]", locale);

          tasks.push({ sourcePath, targetPath, locale, format });
          continue;
        }

        if ("from" in pattern) {
          const sourcePath = pattern.from;
          if (filter && !filter(sourcePath)) continue;

          const targetPath =
            typeof pattern.to === "string"
              ? pattern.to.replace("[locale]", locale)
              : pattern.to(locale);

          tasks.push({ sourcePath, targetPath, locale, format });
          continue;
        }

        for (const sourcePath of await FastGlob(pattern.glob)) {
          if (filter && !filter(sourcePath)) continue;
          const targetPath = pattern.to(sourcePath, locale);

          tasks.push({ sourcePath, targetPath, locale, format });
        }
      }
    }
  }

  return tasks;
}
