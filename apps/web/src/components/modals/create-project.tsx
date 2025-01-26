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
import { useCreateProjectModal } from "@/hooks/use-create-project-modal";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
});

export function CreateProjectModal() {
  const t = useTranslations("createProject");
  const { open, setOpen } = useCreateProjectModal();
  const params = useParams();
  const organizationId = params.organization as string;
  const utils = trpc.useUtils();
  const router = useRouter();

  const createProject = trpc.project.create.useMutation({
    onSuccess: (project) => {
      utils.project.invalidate();
      utils.organization.invalidate();

      router.replace(`/${organizationId}/${project.slug}`);
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
      await createProject.mutateAsync({
        name: values.name,
        organizationId,
      });

      form.reset();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createProjectTitle")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-secondary">
          {t("createProjectDescription")}
        </p>
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
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("projectNamePlaceholder")}
                      {...field}
                    />
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
              <Button type="submit" size="sm">
                {t("createProjectButton")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
