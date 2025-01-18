export type PromptOptions = {
  format: "json" | "js" | "ts" | "md";
  contentLocale: string;
  targetLocale: string;
};

export type Translator = (
  strings: string[],
  options: PromptOptions,
) => Promise<string[]>;
