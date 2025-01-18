declare module "xliff" {
  export interface XliffData {
    version: string;
    srcLang: string;
    trgLang?: string;
    ns?: string;
    resources: {
      [key: string]: {
        source: string;
        target?: string;
      };
    };
  }

  export function xliff2js(data: string): XliffData;
  export function js2xliff(data: XliffData): string;
}
