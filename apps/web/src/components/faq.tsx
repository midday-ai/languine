"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export function FAQ() {
  const t = useTranslations("faq");

  const faqs = [
    {
      question: t("what_is_languine.question"),
      answer: t("what_is_languine.answer"),
    },
    {
      question: t("key_limit.question"),
      answer: t("key_limit.answer"),
    },
    {
      question: t("supported_languages.question"),
      answer: t("supported_languages.answer"),
    },
    {
      question: t("github_action.question"),
      answer: t("github_action.answer"),
    },
    {
      question: t("support.question"),
      answer: t("support.answer"),
    },
    {
      question: t("open_source.question"),
      answer: t("open_source.answer"),
    },
    {
      question: t("open_source_pricing.question"),
      answer: t("open_source_pricing.answer"),
    },
    {
      question: t("cancel_subscription.question"),
      answer: t("cancel_subscription.answer"),
    },
  ];

  return (
    <div className="pt-10 md:pt-20">
      <h2 className="text-sm font-regular border-b border-border pb-4 mb-2">
        {t("title")}
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
