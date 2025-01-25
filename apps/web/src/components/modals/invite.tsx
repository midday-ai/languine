"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
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
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function InviteModal() {
  const t = useI18n();
  const { open, setOpen } = useInviteModal();
  const utils = trpc.useUtils();
  const params = useParams();

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

  const inviteMutation = trpc.organization.inviteMember.useMutation({
    onSuccess: () => {
      utils.organization.getInvites.invalidate();
      form.reset();
      setOpen(false);
      toast.success(t("invite.success.title"), {
        description: t("invite.success.description", {
          email: form.getValues("email"),
        }),
      });
    },
    onError: (error) => {
      console.error("Failed to invite member:", error);
      toast.error(t("invite.error.title"), {
        description: error.message || t("invite.error.description"),
      });
    },
  });

  async function onSubmit(values: { email: string }) {
    inviteMutation.mutate({
      organizationId: params.organization as string,
      email: values.email,
      role: "member",
    });
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
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                {t("invite.cancel")}
              </Button>
              <Button type="submit" loading={inviteMutation.isLoading}>
                {t("invite.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
