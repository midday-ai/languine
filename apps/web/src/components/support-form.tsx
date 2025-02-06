"use client";

import { submitSupportRequest } from "@/actions/support";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/session";
import { type SupportFormData, supportFormSchema } from "@/lib/schemas/support";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function SupportForm() {
  const t = useTranslations("support_form");
  const { session } = useSession();
  const params = useParams();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      severity: undefined,
      description: "",
    },
  });

  async function onSubmit(values: SupportFormData) {
    if (!session?.user) {
      toast.error("You must be logged in to submit a support request");
      return;
    }

    if (!params.project || !params.organization) {
      toast.error("Missing project or organization information");
      return;
    }

    const result = await submitSupportRequest({
      ...values,
      name:
        session.user.user_metadata.full_name || session.user.email || "Unknown",
      email: session.user.email || "Unknown",
      projectId: params.project as string,
      organizationId: params.organization as string,
    });

    if (result.success) {
      toast.success("Support request sent successfully");
      form.reset();
    } else {
      toast.error(result.error || "Failed to send support request");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("severity")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_severity")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">{t("low")}</SelectItem>
                  <SelectItem value="medium">{t("medium")}</SelectItem>
                  <SelectItem value="high">{t("high")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("describe_issue")}
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton isSubmitting={form.formState.isSubmitting}>
          {t("submit")}
        </SubmitButton>
      </form>
    </Form>
  );
}
