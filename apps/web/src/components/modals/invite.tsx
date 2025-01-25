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
import { useInviteModal } from "@/hooks/use-invite-modal";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function InviteModal() {
  const t = useTranslations("invite");
  const { open, setOpen } = useInviteModal();
  const utils = trpc.useUtils();
  const params = useParams();

  const form = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({
        email: z.string().email(t("validation.invalidEmail")),
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
      toast.success(t("success.title"), {
        description: t("success.description", {
          email: form.getValues("email"),
        }),
      });
    },
    onError: (error) => {
      console.error("Failed to invite member:", error);
      toast.error(t("error.title"), {
        description: error.message || t("error.description"),
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
          <DialogTitle>{t("inviteMember")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-secondary">{t("inviteDescription")}</p>
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
                  <FormLabel>{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
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
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={inviteMutation.isLoading}>
                {t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
