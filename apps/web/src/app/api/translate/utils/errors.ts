import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidationErrorMessage } from "./validation";

const errorMessages: Record<string, { status: number; message: string }> = {
  "Invalid API key": {
    status: 401,
    message: "The provided API key is invalid. Please check your credentials.",
  },
  "Invalid API key format": {
    status: 401,
    message: "API key must start with 'org_'. Please check your credentials.",
  },
  "Project not found or access denied": {
    status: 403,
    message: "You don't have access to this project or it doesn't exist.",
  },
  "Translation key limit reached": {
    status: 403,
    message:
      "You've reached your translation key limit. Please upgrade your plan to continue.",
  },
  "Document limit reached": {
    status: 403,
    message:
      "You've reached your document limit. Please upgrade your plan to continue.",
  },
};

export const handleError = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: getValidationErrorMessage(error),
      },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    const errorInfo = errorMessages[error.message] || {
      status: 500,
      message: "An unexpected error occurred while processing your request.",
    };

    return NextResponse.json(
      {
        success: false,
        error: errorInfo.message,
      },
      { status: errorInfo.status },
    );
  }

  console.error("Translation error:", error);
  return NextResponse.json(
    {
      success: false,
      error:
        "Something went wrong while processing your translation request. Please try again later.",
    },
    { status: 500 },
  );
};
