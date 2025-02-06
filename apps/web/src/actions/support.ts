"use server";

import SupportEmail from "@/emails/templates/support";
import { resend } from "@/lib/resend";
import {
  type SupportRequest,
  supportRequestSchema,
} from "@/lib/schemas/support";

export async function submitSupportRequest(values: SupportRequest) {
  try {
    // Validate the input
    const validatedData = supportRequestSchema.parse(values);

    await resend.emails.send({
      from: "Languine Support <support@emails.languine.ai>",
      to: "support@languine.ai",
      subject: `[${validatedData.severity.toUpperCase()}] New Support Request from ${validatedData.name}`,
      react: SupportEmail({
        name: validatedData.name,
        email: validatedData.email,
        severity: validatedData.severity,
        description: validatedData.description,
        projectId: validatedData.projectId,
        organizationId: validatedData.organizationId,
      }),
    });

    return { success: true as const };
  } catch (error) {
    console.error("Failed to send support request:", error);
    if (error instanceof Error) {
      return {
        success: false as const,
        error: error.message,
      };
    }
    return {
      success: false as const,
      error: "Failed to send support request",
    };
  }
}
