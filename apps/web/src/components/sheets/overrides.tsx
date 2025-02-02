"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOverridesSheet } from "@/hooks/use-overrides-sheet";
import { useTranslations } from "next-intl";
import { SubmitButton } from "../ui/submit-button";
import { Textarea } from "../ui/textarea";

const content = [
  {
    id: "1",
    locale: "en",
    translation: "Hello, world!",
  },
  {
    id: "2",
    locale: "fr",
    translation: "Bonjour, le monde!",
  },
  {
    id: "3",
    locale: "es",
    translation: "Hola, mundo!",
  },
  {
    id: "4",
    locale: "de",
    translation: "Hallo, Welt!",
  },
  {
    id: "5",
    locale: "it",
    translation: "Ciao, mondo!",
  },
  {
    id: "6",
    locale: "km",
    translation: "សួស្តីបណ្តុះបណ្តាលបានទាញយកបានទេ",
  },
];

export function OverridesSheet() {
  const { translationId, locale, setQueryStates } = useOverridesSheet();
  const t = useTranslations("overrides_sheet");

  return (
    <Sheet
      open={Boolean(translationId)}
      onOpenChange={(value) => setQueryStates(null)}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <Accordion type="single" defaultValue={locale} className="mt-6">
          {content.map((item) => (
            <AccordionItem key={item.id} value={item.locale}>
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-primary capitalize">
                    {new Intl.DisplayNames([item.locale], {
                      type: "language",
                    }).of(item.locale)}
                  </span>
                  <span className="text-secondary">[{item.locale}]</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Textarea
                  className="p-4 border-primary border border-dashed"
                  value={item.translation}
                  onChange={(e) => {
                    console.log(e.target.value);
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <SubmitButton className="w-full" isSubmitting={false}>
            {t("save")}
          </SubmitButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
