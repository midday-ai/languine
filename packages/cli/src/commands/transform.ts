import { readFile, writeFile } from "node:fs/promises";
// import { createOpenAI } from "@ai-sdk/openai";
import { spinner } from "@clack/prompts";
import { generateObject } from "ai";
import chalk from "chalk";
import glob from "fast-glob";
import { ollama } from "ollama-ai-provider";
import { z } from "zod";

const model = ollama("mistral");

const BATCH_SIZE = 5;

const argsSchema = z.array(z.string()).transform((args) => {
  const [sourceDir] = args;
  if (!sourceDir) {
    throw new Error("Source directory is required");
  }
  return {
    sourceDir,
  };
});

async function processFilesBatch(files: string[]) {
  const processFile = async (file: string) => {
    const s = spinner();
    try {
      const fileName = file.split("/").pop() || file;
      s.start(`Transforming ${chalk.blue(fileName)}...`);

      const content = await readFile(file, "utf-8");
      const componentName =
        file
          .split("/")
          .pop()
          ?.replace(/\.[jt]sx?$/, "") || "";

      const prompt = `You are a code transformation expert. Your task is to internationalize a React component by replacing text strings with t() function calls.

COMPONENT NAME: ${componentName}

RULES FOR TRANSFORMATION:
1. Text Replacement Rules:
   - In JSX: Replace "text" with {t('key')}
   - In assignments: Replace "text" with t('key')
   - In template literals: Replace \`text\` with t('key')
   - Preserve exact spacing and indentation
   - Keep all other code unchanged

2. What NOT to Transform:
   - Variable names and properties
   - HTML/CSS class names
   - URLs and paths
   - Data attributes
   - Technical identifiers
   - Empty strings
   - Console logs
   - Comments

3. Key Generation Rules:
   - Format: ${componentName}.camelCaseDescription
   - Examples:
     - Button text -> ${componentName}.buttonText
     - Form label -> ${componentName}.formLabel
     - Error message -> ${componentName}.errorMessage
   - Make keys descriptive of both location and content
   - Use camelCase for the description part

4. Code Style Preservation:
   - Keep all imports unchanged
   - Maintain exact indentation
   - Preserve all line breaks
   - Keep all comments in place
   - Maintain all existing JSX attributes

EXAMPLE:
Input:
  <div className="form">
    <h1>Welcome back</h1>
    <p>Please fill your details</p>
    <button type="submit">Sign in</button>
  </div>

Output:
  <div className="form">
    <h1>{t('${componentName}.welcomeHeading')}</h1>
    <p>{t('${componentName}.formInstructions')}</p>
    <button type="submit">{t('${componentName}.signInButton')}</button>
  </div>

COMPONENT CODE TO TRANSFORM:
${content}

Return the exact file content with strings replaced and provide a list of all translations made.`;

      const { object } = await generateObject({
        model,
        schema: z.object({
          transformedCode: z
            .string()
            .describe("The transformed component code"),
          translations: z.array(
            z.object({
              key: z
                .string()
                .describe(
                  `Translation key in format '${componentName}.camelCaseDescription'`,
                ),
              originalText: z
                .string()
                .describe("The exact original text that was replaced"),
            }),
          ),
        }),
        prompt,
        temperature: 0.1,
      });

      console.log(object);

      // Write the transformed component
      //   await writeFile(file, object.transformedCode, "utf-8");

      s.stop(
        chalk.green(
          `✓ Transformed ${fileName} (${object.translations.length} strings found)`,
        ),
      );

      return {
        file,
        success: true,
        translations: object.translations,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      s.stop(chalk.red(`✗ Failed to transform ${file}: ${errorMessage}`));
      return { file, success: false, error };
    }
  };

  // Process all files in parallel
  return Promise.all(files.map(processFile));
}

export async function transformCommand(args: string[] = []) {
  const s = spinner();
  try {
    const { sourceDir } = argsSchema.parse(args);
    s.start("Searching for React component files...");

    const files = await glob([
      `${sourceDir}/**/*.tsx`,
      `${sourceDir}/**/*.jsx`,
    ]);

    if (files.length === 0) {
      s.stop("No React component files found");
      return;
    }

    s.stop(`Found ${files.length} React component files`);

    // Process files in batches
    let processedCount = 0;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      processedCount += batch.length;
      console.log(
        chalk.blue(
          `\nBatch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(files.length / BATCH_SIZE)} (${processedCount}/${files.length} files)`,
        ),
      );
      await processFilesBatch(batch);
    }

    console.log(chalk.green("\n✨ Transformation complete!"));
  } catch (error) {
    const transformError = error as Error;
    s.stop(chalk.red(`Transform process failed: ${transformError.message}`));
    process.exit(1);
  }
}
