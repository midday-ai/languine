"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Icons } from "../ui/icons";
import { Spinner } from "../ui/spinner";

type Provider = {
  value: string;
  label: string;
  models: { value: string; label: string }[];
  icon: React.ComponentType;
};

const PROVIDERS: Provider[] = [
  {
    value: "openai",
    label: "OpenAI",
    models: [
      { value: "gpt-4-turbo", label: "GPT-4 Turbo (Default)" },
      { value: "gpt-4", label: "GPT-4" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    ],
    icon: Icons.OpenAI,
  },
  {
    value: "xai",
    label: "xAI",
    models: [{ value: "grok", label: "Grok" }],
    icon: Icons.xAI,
  },
];

interface ProviderSettingsForm {
  provider: string;
  apiKey: string;
  model: string;
}

export function ProviderSettingsModal({
  isConnected,
}: {
  isConnected?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider>(
    PROVIDERS[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { organization, project } = useParams();
  const trpcUtils = trpc.useUtils();

  const updateMutation = trpc.project.updateSettings.useMutation({
    onSuccess: () => {
      trpcUtils.project.getBySlug.invalidate({
        slug: project as string,
        organizationId: organization as string,
      });
      setIsSubmitting(false);
      setOpen(false);
    },
    onError: (error) => {
      setIsSubmitting(false);
    },
  });

  const form = useForm<ProviderSettingsForm>({
    defaultValues: {
      provider: PROVIDERS[0].value,
      apiKey: "",
      model: PROVIDERS[0].models[0].value,
    },
  });

  const onSubmit = async (data: ProviderSettingsForm) => {
    setIsSubmitting(true);

    await updateMutation.mutateAsync({
      slug: project as string,
      organizationId: organization as string,
      settings: {
        provider: data.provider,
        model: data.model,
        providerApiKey: data.apiKey,
      },
    });
  };

  const getApiKeyPlaceholder = (provider: string) => {
    switch (provider) {
      case "openai":
        return "sk-...";
      case "xai":
        return "xai-...";
      default:
        return "Enter API key";
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        {isConnected && <div className="size-1.5 rounded-full bg-green-500" />}
        {isConnected ? "Edit Connection" : "Connect Provider"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Provider Settings</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-6"
          >
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <p className="text-xs text-muted-foreground">
                Choose your preferred AI service for translations
              </p>
              <Select
                value={selectedProvider.value}
                onValueChange={(value) => {
                  const provider = PROVIDERS.find((p) => p.value === value)!;
                  setSelectedProvider(provider);
                  form.setValue("provider", provider.value);
                  form.setValue("model", provider.models[0].value);
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {selectedProvider.icon && <selectedProvider.icon />}
                      {selectedProvider.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      <div className="flex items-center gap-2">
                        {provider.icon && <provider.icon />}
                        {provider.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <p className="text-xs text-muted-foreground">
                Select the AI model for translations
              </p>
              <Select
                value={form.watch("model")}
                onValueChange={(value) => {
                  const model = selectedProvider.models.find(
                    (m) => m.value === value,
                  )!;

                  if (model) {
                    form.setValue("model", model.value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {
                      selectedProvider.models.find(
                        (m) => m.value === form.watch("model"),
                      )?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider.models.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <p className="text-xs text-muted-foreground">
                Enter your API key to authenticate with your provider
              </p>
              <Input
                id="apiKey"
                autoComplete="off"
                placeholder={getApiKeyPlaceholder(selectedProvider.value)}
                {...form.register("apiKey", { required: true })}
              />
            </div>

            <DialogFooter className="flex gap-4 pt-8">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" size="sm" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
