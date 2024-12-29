import { generateObject } from "ai";
import dedent from "dedent";
import { diffLines } from "diff";
import { z } from "zod";
import { debug } from "../debug.js";
import { baseRequirements, createBasePrompt } from "../prompt.js";
import type { PromptOptions, Translator } from "../types.js";

function createRegex(quote: string, multiline = false) {
  return `${quote}(?:\\\\.|[^${quote}\\\\${multiline ? "" : "\\n"}])*${quote}`;
}

const quotesRegex = new RegExp(
  `${createRegex(`"`)}|${createRegex(`'`)}|${createRegex("`", true)}`,
  "g",
);

interface StringMatch {
  index: number;

  /**
   * content, including quotes
   */
  content: string;
}

/**
 * Get declared strings from code (e.g. "hello world" or `hello ${world}`)
 */
function getStrings(code: string) {
  let match = quotesRegex.exec(code);

  const strings: StringMatch[] = [];

  while (match) {
    // Skip if the string is a key (contains dots or #)
    if (!match[0].includes(".") && !match[0].includes("#")) {
      strings.push({
        index: match.index,
        content: match[0],
      });
    }

    match = quotesRegex.exec(code);
  }

  return strings;
}

function replaceStrings(
  code: string,
  strings: StringMatch[],
  replaces: string[],
) {
  let out = code;

  replaces.forEach((replace, i) => {
    const original = strings[i];
    if (!original) return; // Skip if no matching original string

    const offset = out.length - code.length;
    const quote = original.content[0]; // Get the quote character used

    // Keep original quotes but ensure replacement content is complete
    const wrappedReplace = replace.startsWith(quote)
      ? replace
      : `${quote}${replace}${quote}`;

    out =
      out.slice(0, original.index + offset) +
      wrappedReplace +
      out.slice(original.index + original.content.length + offset);
  });

  return out;
}

export const javascript: Translator = {
  // detect changes
  // translate changes
  // apply translated changes to previous translation (assuming line breaks are identical)
  async onUpdate(options) {
    debug("Running JavaScript translator onUpdate");
    const diff = diffLines(options.previousContent, options.content);
    const strings = getStrings(options.content);
    const previousTranslation = getStrings(options.previousTranslation);
    const toTranslate: StringMatch[] = [];

    let lineStartIdx = 0;
    for (const change of diff) {
      if (change.added) {
        const affected = strings.filter(
          (v) =>
            v.index >= lineStartIdx &&
            v.index < lineStartIdx + change.value.length,
        );

        toTranslate.push(...affected);
      }

      if (!change.removed) {
        lineStartIdx += change.value.length;
      }
    }

    debug(`Found ${toTranslate.length} strings to translate in changes`);

    let translated: string[] = [];

    if (toTranslate.length > 0) {
      const { object } = await generateObject({
        model: options.model,
        prompt: getPrompt(toTranslate, options),
        temperature: options.config.llm?.temperature ?? 0,
        schema: z.object({
          items: z.array(z.string()),
        }),
      });

      translated = object.items;
      debug(`Received ${translated.length} translations`);
    }

    const output = replaceStrings(
      options.content,
      strings,
      strings.map((s) => {
        const j = toTranslate.indexOf(s);

        if (j !== -1) {
          return translated[j];
        }

        const prevIndex = previousTranslation.findIndex(
          (pt) => pt.content === s.content,
        );
        return prevIndex !== -1
          ? previousTranslation[prevIndex].content
          : s.content;
      }),
    );

    return {
      summary: `Translated ${toTranslate.length} new keys`,
      content: output,
    };
  },
  async onNew(options) {
    debug("Running JavaScript translator onNew");

    const strings = getStrings(options.content);

    const { object } = await generateObject({
      model: options.model,
      prompt: getPrompt(strings, options),
      temperature: options.config.llm?.temperature ?? 0,
      schema: z.object({
        items: z.array(
          z
            .string()
            .describe("The translations of the strings in string format"),
        ),
      }),
    });

    debug(`Received ${object.items.length} translations`);

    return {
      content: replaceStrings(options.content, strings, object.items),
    };
  },
};

function getPrompt(strings: StringMatch[], options: PromptOptions) {
  debug(`Creating prompt for ${strings.length} strings`);

  const text = dedent`
    ${baseRequirements}
    - Preserve all object/property keys, syntax characters, and punctuation marks exactly
    - Only translate text content within quotation marks
    - Only return the translations in a JSON array of strings as the schema requires and not as enum values
    
    A list of javascript strings to translate. Return the translations in a JSON array of strings:`;

  const codeblocks = strings
    .map((v) => {
      return `\`\`\`${options.format}\n${v.content}\n\`\`\``;
    })
    .join("\n\n");

  return createBasePrompt(`${text}\n${codeblocks}`, options);
}
