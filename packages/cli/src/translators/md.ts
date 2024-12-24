import type { PromptOptions, Translator } from "../types.js";
import { createBasePrompt } from "../prompt.js";
import dedent from "dedent";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { getChangedContent } from "../utils.js";

function extractDiff(diff: string) {
  const added: number[] = [];
  const removed: number[] = [];
  const lines = diff.split("\n");

  lines.forEach((line, i) => {
    if (line.startsWith("+") && !line.startsWith("+++")) added.push(i);
    else if (line.startsWith("-") && !line.startsWith("---")) removed.push(i);
  });

  return {
    lines,
    added,
    removed,
    // translate only non-empty lines
    translate: added.filter((num) => lines[num].length > 1),
  };
}

// docs usually have a context, it's better to provide the full-context of original text to help AI
export const markdown: Translator = {
  async onUpdate(options) {
    const parsedDiff = extractDiff(options.diff);
    const linesToTranslate = parsedDiff.translate;

    const { object: arr } = await generateObject({
      model: options.model,
      schema: z.array(z.string()),
      prompt: getPrompt(
        `
Translate only ${linesToTranslate.map((num) => `line ${num + 1}`).join(", ")}, and return in the form of a JSON array like:
${JSON.stringify(linesToTranslate.map((num) => `translated content of line ${num + 1}`))}

Source Content:
${options.content}`,
        options,
      ),
    });

    const lines = options.previousTranslation.split("\n");

    for (const lineIdx of parsedDiff.added) {
      const i = parsedDiff.translate.indexOf(lineIdx);

      lines.splice(
        lineIdx,
        0,
        i === -1 ? getChangedContent(parsedDiff.lines[lineIdx]) : arr[i],
      );
    }

    for (const lineIdx of parsedDiff.removed) {
      lines.splice(lineIdx, 1);
    }

    return {
      summary: `Translated ${arr.length} lines`,
      content: lines.join("\n"),
    };
  },
  async onNew(options) {
    const { text } = await generateText({
      model: options.model,
      prompt: getPrompt(
        `Return only the translated content
            
Source Content:
${options.content}`,
        options,
      ),
    });

    return {
      content: text,
    };
  },
};

function getPrompt(base: string, options: PromptOptions) {
  const text = dedent`
    Translation Requirements:
    - Only translate frontmatter, and text content (including those in HTML/JSX)
    - Keep original code comments, line breaks, code, and codeblocks
    - Keep consistent capitalization, and spacing
    - Provide natural, culturally-adapted translations that sound native
    - Retain all code elements like variables, functions, and control structures
    - Handle special characters and escape sequences correctly
    - Respect existing whitespace and newline patterns
    - Keep all technical identifiers unchanged

    ${base}
  `;

  return createBasePrompt(text, options);
}
