"use client";

import { CopyInput } from "@/components/copy-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TRPCClientError } from "@trpc/client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function SettingsTitle({ title }: { title: string }) {
  return (
    <h2 className="text-lg p-8 pl-0 pt-6 font-normal font-mono">{title}</h2>
  );
}

export function SettingsSeparator() {
  return <div className="w-full h-12 bg-dotted my-12 max-w-screen-xl" />;
}

export function SettingsCard({
  title,
  description,
  type = "input",
  value,
  onChange,
  onSave,
  checked,
  onCheckedChange,
  options,
  placeholder,
  isLoading,
  validate,
  onUpdate,
}: {
  title: string;
  description: string;
  type?: "input" | "textarea" | "switch" | "select" | "copy-input";
  value?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  options?: { label: string; value: string; icon?: () => JSX.Element }[];
  placeholder?: string;
  isLoading?: boolean;
  validate?: "email" | "url" | "number" | "password" | "text";
  onUpdate?: () => void;
}) {
  const t = useTranslations("settings");
  const [isSaving, setIsSaving] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? "");

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave?.(inputValue);

      toast.success(t("saved"), {
        description: t("savedDescription"),
      });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        if (error.data?.code === "FORBIDDEN") {
          toast.error(t("permissionDenied"), {
            description: t("permissionDeniedDescription"),
          });
        } else {
          toast.error(t("error"), {
            description: t("errorDescription"),
          });
        }
      } else {
        toast.error(t("error"), {
          description: t("errorDescription"),
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckedChange = async (checked: boolean) => {
    try {
      setIsSaving(true);
      await onCheckedChange?.(checked);

      toast.success(t("saved"), {
        description: t("savedDescription"),
      });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        if (error.data?.code === "FORBIDDEN") {
          toast.error(t("permissionDenied"), {
            description: t("permissionDeniedDescription"),
          });
        } else {
          toast.error(t("error"), {
            description: t("errorDescription"),
          });
        }
      } else {
        toast.error(t("error"), {
          description: t("errorDescription"),
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectChange = async (value: string) => {
    try {
      setIsSaving(true);
      await onChange?.(value);

      toast.success(t("saved"), {
        description: t("savedDescription"),
      });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        if (error.data?.code === "FORBIDDEN") {
          toast.error(t("permissionDenied"), {
            description: t("permissionDeniedDescription"),
          });
        } else {
          toast.error(t("error"), {
            description: t("errorDescription"),
          });
        }
      } else {
        toast.error(t("error"), {
          description: t("errorDescription"),
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8 max-w-screen-xl">
        <Card className="w-full bg-noise">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Skeleton className="h-5 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
              {type === "switch" && <Skeleton className="h-6 w-10" />}
              {type === "select" && (
                <Skeleton className="h-10 w-full md:w-[240px]" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8 max-w-screen-xl">
      <Card className="w-full bg-noise">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-normal mb-2">
                {title}
              </CardTitle>
              <p className="text-sm text-secondary">{description}</p>
            </div>
            {type === "switch" && (
              <Switch
                checked={checked}
                onCheckedChange={(value) => {
                  handleCheckedChange?.(!!value);
                }}
              />
            )}

            {type === "select" && options && (
              <div className="w-full md:w-[240px] md:ml-6">
                <Select value={value} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder}>
                      <div className="flex items-center w-full gap-2">
                        {options.find((opt) => opt.value === value)?.icon && (
                          <span>
                            {options
                              .find((opt) => opt.value === value)
                              ?.icon?.()}
                          </span>
                        )}
                        <span>
                          {options.find((opt) => opt.value === value)?.label}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center w-full gap-2">
                          {option.icon && <span>{option.icon()}</span>}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {type === "input" && (
            <form
              className="flex flex-col md:flex-row gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue?.(e.target.value)}
                placeholder={placeholder}
                type={validate}
                required
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0"
              >
                {isSaving && <Spinner size="sm" />}
                {t("save")}
              </Button>
            </form>
          )}
          {type === "textarea" && (
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue?.(e.target.value)}
                rows={4}
                placeholder={placeholder}
                required
              />
              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 self-end mt-4 md:mt-0 w-full md:w-auto"
              >
                {isSaving && <Spinner size="sm" />}
                {t("save")}
              </Button>
            </form>
          )}
          {type === "copy-input" && value && (
            <CopyInput
              value={value}
              placeholder={placeholder}
              onUpdate={onUpdate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
