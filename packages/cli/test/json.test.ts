import { expect, test } from "vitest";
import { Config } from "../src/types.js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { MockLanguageModelV1 } from "ai/test";
import { getChangedContent } from "../src/utils.js";
import { json } from "../src/translators/json.js";

const dir = path.dirname(fileURLToPath(import.meta.url));

const translated = {
  search: "搜索",
  searchNoResult: "未找到结果",
  toc: "本页内容",
  tocNoHeadings: "无标题",
  lastUpdate: "最后更新于",
  chooseLanguage: "选择语言",
  nextPage: "下一页",
  previousPage: "上一页",
  chooseTheme: "主题",
  editOnGithub: "在GitHub上编辑",
};

test("JSON adapter: new", async () => {
  const result = await json.onNew({
    config: {} as unknown as Config,
    content: await readFile(path.join(dir, "resources/json-new.json")).then(
      (res) => res.toString(),
    ),
    format: "json",
    contentLocale: "en",
    targetLocale: "cn",
    model: new MockLanguageModelV1({
      defaultObjectGenerationMode: "json",
      async doGenerate(v) {
        return {
          rawCall: { rawPrompt: null, rawSettings: {} },
          finishReason: "stop",
          usage: { promptTokens: 10, completionTokens: 20 },
          text: JSON.stringify(translated),
        };
      },
    }),
  });

  await expect(result.content).toMatchFileSnapshot("snapshots/json-new.json");
});

test("JSON adapter: diff", async () => {
  const diff = await readFile(
    path.join(dir, "resources/json-diff.diff.txt"),
  ).then((res) => res.toString());

  const result = await json.onUpdate({
    config: {} as unknown as Config,
    content: getChangedContent(diff),
    previousTranslation: await readFile(
      path.join(dir, "resources/json-diff.translated.json"),
    ).then((res) => res.toString()),
    diff,
    format: "json",
    model: new MockLanguageModelV1({
      defaultObjectGenerationMode: "json",
      async doGenerate(v) {
        return {
          rawCall: { rawPrompt: null, rawSettings: {} },
          finishReason: "stop",
          usage: { promptTokens: 10, completionTokens: 20 },
          text: JSON.stringify({
            search: translated.search,
          }),
        };
      },
    }),
    contentLocale: "en",
    targetLocale: "cn",
  });

  await expect(result.content).toMatchFileSnapshot("snapshots/json-diff.json");
});
