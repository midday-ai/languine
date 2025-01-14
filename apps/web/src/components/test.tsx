"use client";

import { getI18n } from "@/locales/server";
import { trpc } from "@/trpc/client";

export function Test() {
  const { mutateAsync } = trpc.translate.pushTranslations.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <button
      type="button"
      onClick={() =>
        mutateAsync({
          projectId: "vkluv2xl7z9kfcjgilk743c5",
          sourceFormat: "js",
          sourceLanguage: "en",
          targetLanguage: "sv",
          content: [
            { key: "hello", sourceText: "Hej" },
            { key: "thank-you", sourceText: "Tack" },
            { key: "welcome", sourceText: "Välkommen {name}" },
            { key: "goodbye", sourceText: "Hejdå" },
            { key: "see-you", sourceText: "Vi ses senare" },
            { key: "good-morning", sourceText: "God morgon" },
            { key: "good-evening", sourceText: "God kväll" },
            { key: "how-are-you", sourceText: "Hur mår du?" },
            { key: "fine-thanks", sourceText: "Jag mår bra, tack" },
            { key: "nice-meet", sourceText: "Trevligt att träffas" },
            { key: "please", sourceText: "Var snäll" },
            { key: "excuse-me", sourceText: "Ursäkta" },
            { key: "sorry", sourceText: "Förlåt" },
            { key: "congrats", sourceText: "Grattis!" },
            { key: "help", sourceText: "Kan du hjälpa mig?" },
            { key: "understand", sourceText: "Jag förstår" },
            { key: "dont-understand", sourceText: "Jag förstår inte" },
            { key: "repeat", sourceText: "Kan du upprepa det?" },
            { key: "speak-slowly", sourceText: "Kan du prata långsammare" },
            { key: "name-is", sourceText: "Jag heter {name}" },
            { key: "where-from", sourceText: "Var kommer du ifrån?" },
            { key: "live-in", sourceText: "Jag bor i {city}" },
            { key: "age", sourceText: "Jag är {age} år gammal" },
            { key: "birthday", sourceText: "Grattis på födelsedagen!" },
            { key: "good-luck", sourceText: "Lycka till!" },
            { key: "take-care", sourceText: "Ta hand om dig" },
            { key: "have-nice-day", sourceText: "Ha en trevlig dag" },
            { key: "good-night", sourceText: "God natt" },
            { key: "sweet-dreams", sourceText: "Sov gott" },
            { key: "welcome-back", sourceText: "Välkommen tillbaka" },
            { key: "miss-you", sourceText: "Jag saknar dig" },
            { key: "love-you", sourceText: "Jag älskar dig" },
            { key: "feel-better", sourceText: "Krya på dig" },
            { key: "get-well", sourceText: "Bli snart frisk" },
            { key: "thinking-of-you", sourceText: "Tänker på dig" },
            { key: "proud-of-you", sourceText: "Jag är stolt över dig" },
            { key: "believe-in-you", sourceText: "Jag tror på dig" },
            { key: "count-on-me", sourceText: "Du kan räkna med mig" },
            { key: "here-for-you", sourceText: "Jag finns här för dig" },
            { key: "miss-you-lots", sourceText: "Saknar dig mycket" },
            { key: "take-it-easy", sourceText: "Ta det lugnt" },
            { key: "hang-in-there", sourceText: "Håll ut" },
            { key: "chin-up", sourceText: "Upp med hakan" },
          ],
        })
      }
    >
      Test
    </button>
  );
}
