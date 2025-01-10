"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useInviteModal } from "@/hooks/use-invite-modal";
import { authClient } from "@/lib/auth/client";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function InviteModal() {
  const t = useI18n();
  const { open, setOpen } = useInviteModal();
  const utils = trpc.useUtils();

  const form = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({
        email: z.string().email(t("invite.validation.invalidEmail")),
      }),
    ),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);

  async function onSubmit(values: { email: string }) {
    try {
      await authClient.organization.inviteMember({
        email: values.email,
        role: "member",
      });

      utils.organization.getInvites.invalidate();
      form.reset();
      setOpen(false);
      toast.success(t("invite.success.title"), {
        description: t("invite.success.description", { email: values.email }),
      });
    } catch (error) {
      console.error("Failed to invite member:", error);
      toast.error(t("invite.error.title"), {
        description: t("invite.error.description"),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("invite.inviteMember")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-secondary">
          {t("invite.inviteDescription")}
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("invite.emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("invite.emailPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 pt-4 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpen(false)}
                type="button"
              >
                {t("invite.cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  t("invite.sendInvite")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
