"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/locales/client";

export function FAQ() {
  const t = useI18n();

  const faqs = [
    {
      question: t("faq.what_is_languine.question"),
      answer: t("faq.what_is_languine.answer"),
    },
    {
      question: t("faq.key_limit.question"),
      answer: t("faq.key_limit.answer"),
    },
    {
      question: t("faq.supported_languages.question"),
      answer: t("faq.supported_languages.answer"),
    },
    {
      question: t("faq.github_action.question"),
      answer: t("faq.github_action.answer"),
    },
    {
      question: t("faq.support.question"),
      answer: t("faq.support.answer"),
    },
    {
      question: t("faq.open_source.question"),
      answer: t("faq.open_source.answer"),
    },
    {
      question: t("faq.open_source_pricing.question"),
      answer: t("faq.open_source_pricing.answer"),
    },
    {
      question: t("faq.cancel_subscription.question"),
      answer: t("faq.cancel_subscription.answer"),
    },
  ];

  return (
    <div className="pt-10 md:pt-20">
      <h2 className="text-sm font-regular border-b border-border pb-4 mb-2">
        {t("faq.title")}
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index.toString()}
            value={`item-${index}`}
            className="md:px-8"
          >
            <AccordionTrigger className="text-left text-sm font-regular">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-secondary text-xs">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
