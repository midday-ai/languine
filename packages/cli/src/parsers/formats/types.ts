export type XcstringsTranslationEntity = {
  localizations?: Record<
    string,
    {
      stringUnit?: { value: string };
      variations?: {
        plural?: Record<string, { stringUnit?: { value: string } }>;
      };
    }
  >;
};

export type XcstringsOutput = {
  strings: Record<
    string,
    {
      extractionState: string;
      localizations: Record<
        string,
        {
          stringUnit: {
            state: string;
            value: string;
          };
        }
      >;
    }
  >;
  version: string;
  sourceLanguage: string;
};
