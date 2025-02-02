"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOverridesSheet } from "@/hooks/use-overrides-sheet";
import { trpc } from "@/trpc/client";
import { useTranslations } from "next-intl";
import { SubmitButton } from "../ui/submit-button";
import { Textarea } from "../ui/textarea";

export function OverridesSheet() {
  const { translationKey, projectId, locale, setQueryStates } =
    useOverridesSheet();
  const t = useTranslations("overrides_sheet");

  const { data: translations } = trpc.translate.getTranslationsByKey.useQuery(
    {
      projectId: projectId as string,
      translationKey: translationKey as string,
    },
    {
      enabled: Boolean(projectId && translationKey),
    },
  );

  const sortedTranslations = translations?.sort((a, b) => {
    if (a.targetLanguage === locale) return -1;
    if (b.targetLanguage === locale) return 1;
    return a.targetLanguage.localeCompare(b.targetLanguage);
  });

  return (
    <Sheet
      open={Boolean(translationKey)}
      onOpenChange={() => setQueryStates(null)}
    >
      <SheetContent>
        <div className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>{t("title")}</SheetTitle>
            <SheetDescription>{t("description")}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto mt-6 pr-2">
            <Accordion type="single" defaultValue={locale} collapsible>
              {sortedTranslations?.map((translation) => (
                <AccordionItem
                  key={translation.id}
                  value={translation.targetLanguage}
                >
                  <AccordionTrigger className="text-sm !no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-primary capitalize">
                        {new Intl.DisplayNames([translation.targetLanguage], {
                          type: "language",
                        }).of(translation.targetLanguage)}
                      </span>
                      <span className="text-secondary">
                        [{translation.targetLanguage}]
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      className="p-4 border-primary border border-dashed"
                      value={translation.translatedText}
                      onChange={(e) => {
                        console.log(e.target.value);
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="pt-6">
            <SubmitButton className="w-full" isSubmitting={false}>
              {t("save")}
            </SubmitButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
