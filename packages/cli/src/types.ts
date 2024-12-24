export type Provider = "openai" | "ollama";
export interface Config {
  version: string;
  locale: {
    source: string;
    targets: string[];
  };
  files: {
    [key: string]: {
      include: string[];
    };
  };
  llm: {
    provider: Provider;
    model: string;
  };
  instructions?: string;
  hooks?: {
    afterTranslate?: (args: {
      content: string;
      filePath: string;
    }) => Promise<string>;
  };
}
