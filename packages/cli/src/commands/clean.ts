import fs from "node:fs/promises";
import path from "node:path";
import { intro, outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import { getConfig } from "../utils.js";

export async function clean() {
  intro("Cleaning unused translations...");

  try {
    const config = await getConfig();
    const s = spinner();
    s.start("Removing unused translation keys...");

    const { source, targets } = config.locale;
    let totalKeysRemoved = 0;

    // Process each file format and pattern
    for (const [format, { include }] of Object.entries(config.files)) {
      for (const pattern of include) {
        const sourcePath =
          typeof pattern === "string"
            ? pattern.replace("[locale]", source)
            : pattern.from.replace("[locale]", source);

        // Read source file to get reference keys
        const sourceContent = await fs.readFile(
          path.join(process.cwd(), sourcePath),
          "utf-8",
        );

        const sourceKeys =
          format === "ts"
            ? Object.keys(
                Function(
                  `return ${sourceContent.replace(/export default |as const;/g, "")}`,
                )(),
              )
            : Object.keys(JSON.parse(sourceContent));

        // Clean each target locale file
        for (const locale of targets) {
          const targetPath =
            typeof pattern === "string"
              ? pattern.replace("[locale]", locale)
              : pattern.from.replace("[locale]", locale);

          try {
            const targetContent = await fs.readFile(
              path.join(process.cwd(), targetPath),
              "utf-8",
            );

            const targetObj =
              format === "ts"
                ? Function(
                    `return ${targetContent.replace(/export default |as const;/g, "")}`,
                  )()
                : JSON.parse(targetContent);

            const targetKeys = Object.keys(targetObj);
            const keysToRemove = targetKeys.filter(
              (key) => !sourceKeys.includes(key),
            );
            totalKeysRemoved += keysToRemove.length;

            // Remove keys not in source
            const cleanedObj = Object.fromEntries(
              Object.entries(targetObj).filter(([key]) =>
                sourceKeys.includes(key),
              ),
            );

            // Format and write cleaned content
            const finalContent =
              format === "ts"
                ? `export default ${JSON.stringify(cleanedObj, null, 2)} as const;\n`
                : JSON.stringify(cleanedObj, null, 2);

            await fs.writeFile(
              path.join(process.cwd(), targetPath),
              finalContent,
              "utf-8",
            );
          } catch (error) {
            console.error(chalk.red(`Error cleaning ${targetPath}:`), error);
          }
        }
      }
    }

    s.stop("Cleaning completed");
    outro(
      totalKeysRemoved > 0
        ? chalk.green(
            `Successfully removed ${totalKeysRemoved} unused translation keys!`,
          )
        : chalk.green("No unused translations found!"),
    );
  } catch (error) {
    outro(chalk.red("Failed to clean translations"));
    console.error(error);
    process.exit(1);
  }
}
