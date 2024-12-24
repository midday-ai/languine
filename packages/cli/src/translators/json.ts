import { generateObject } from "ai";
import { createRecordPrompt } from "../prompt.js";
import { extractChangedKeys } from "../utils.js";
import type { Translator } from "../types.js";

export const json: Translator = {
  async onUpdate(options) {
    const sourceObj = JSON.parse(options.content);
    const changes = extractChangedKeys(options.diff);

    let translated: object | undefined;
    if (changes.addedKeys.length > 0) {
      const contentToTranslate: Record<string, string> = {};
      for (const key of changes.addedKeys) {
        contentToTranslate[key] = sourceObj[key];
      }

      translated = await generateObject({
        model: options.model,
        prompt: createRecordPrompt(contentToTranslate, options),
        output: "no-schema",
      }).then((res) => res.object as object);
    }

    const output = {
      ...JSON.parse(options.previousTranslation),
      ...translated,
    };

    for (const key of changes.removedKeys) {
      if (!translated || !Object.keys(translated).includes(key)) {
        delete output[key];
      }
    }

    return {
      summary: `Translated ${changes.addedKeys.length} new keys`,
      content: JSON.stringify(output, null, 2),
    };
  },
  async onNew(options) {
    const sourceObj = JSON.parse(options.content);

    const { object } = await generateObject({
      model: options.model,
      prompt: createRecordPrompt(sourceObj, options),
      output: "no-schema",
    });

    return {
      content: JSON.stringify(object, null, 2),
    };
  },
};
