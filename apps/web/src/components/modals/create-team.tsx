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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateTeamModal } from "@/hooks/use-create-team-modal";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SubmitButton } from "../ui/submit-button";

const formSchema = z.object({
  name: z.string().min(1, "Team name is required"),
});

export function CreateTeamModal() {
  const t = useTranslations("createTeam");
  const { open, setOpen } = useCreateTeamModal();
  const router = useRouter();
  const utils = trpc.useUtils();

  const createTeam = trpc.organization.create.useMutation({
    onSuccess: (team) => {
      utils.organization.invalidate();

      router.replace(`/${team.id}/default`);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createTeam.mutateAsync({
        name: values.name,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("teamName")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-secondary">{t("createTeamDescription")}</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teamName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("teamNamePlaceholder")} {...field} />
                  </FormControl>
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
                {t("cancel")}
              </Button>
              <SubmitButton isSubmitting={createTeam.isPending} size="sm">
                {t("createTeamButton")}
              </SubmitButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
