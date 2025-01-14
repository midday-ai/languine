export type PromptOptions = {
  format: "json" | "js" | "md";
  contentLocale: string;
  targetLocale: string;
};

export type Translator = (
  strings: string[],
  options: PromptOptions,
) => Promise<string[]>;
