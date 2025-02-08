import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import {
  generateKey,
  getCacheKey,
  getFromCache,
  setInCache,
} from "./utils/cache";
import { verifyApiKeyAndLimits } from "./utils/db";
import { handleError } from "./utils/errors";
import { performTranslation, persistTranslation } from "./utils/translation";
import { translateRequestSchema } from "./utils/validation";

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API key is required. Provide it via x-api-key header",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { projectId, sourceLocale, targetLocale, format, sourceText, cache } =
      translateRequestSchema.parse(body);

    const org = await verifyApiKeyAndLimits(apiKey, projectId, format);
    const key = generateKey(sourceText);
    const cacheKey = getCacheKey(projectId, sourceLocale, targetLocale, key);

    // Check cache
    if (cache) {
      const cachedResult = await getFromCache(cacheKey);
      if (cachedResult) {
        return NextResponse.json({
          success: true,
          translatedText: cachedResult,
          cached: true,
        });
      }
    }

    // Perform translation
    const translatedText = await performTranslation(key, sourceText, {
      sourceLocale,
      targetLocale,
      format,
    });

    // Handle persistence in background
    const isDocument = format === "md" || format === "mdx";

    waitUntil(
      (async () => {
        await persistTranslation(
          {
            projectId,
            organizationId: org.id,
            format,
            key,
            sourceLocale,
            targetLocale,
            sourceText,
            translatedText,
          },
          isDocument,
        );

        if (cache) {
          await setInCache(cacheKey, translatedText);
        }
      })(),
    );

    return NextResponse.json({
      success: true,
      translatedText,
      cached: false,
    });
  } catch (error) {
    return handleError(error);
  }
}
