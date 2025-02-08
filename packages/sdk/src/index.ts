import type { TranslateParams, TranslateResponse } from "./types.js";

export * from "./types.js";

export interface LanguineOptions {
  apiKey: string;
  baseUrl?: string;
}

export class Languine {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: LanguineOptions) {
    const { apiKey, baseUrl = "https://languine.ai" } = options;
    if (!apiKey.startsWith("org_")) {
      throw new Error("Invalid API key format. API key must start with 'org_'");
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));

      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async translate(params: TranslateParams): Promise<TranslateResponse> {
    return this.request<TranslateResponse>("/api/translate", {
      method: "POST",
      body: JSON.stringify({
        projectId: params.projectId,
        sourceLocale: params.sourceLocale,
        targetLocale: params.targetLocale,
        format: params.format || "string",
        sourceText: params.sourceText,
        cache: params.cache ?? true,
      }),
    });
  }
}
