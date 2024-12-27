"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Commands() {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setStep(0);
    }, 2000);

    const timer = setInterval(() => {
      setStep((prev) => (prev < 7 ? prev + 1 : prev));
    }, 1500);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="text-sm font-mono flex flex-col tracking-wide leading-relaxed space-y-0.5">
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 0 ? "opacity-100" : "opacity-0",
        )}
      >
        │
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 0 ? "opacity-100" : "opacity-0",
        )}
      >
        ◇ What would you like to do?
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 0 ? "opacity-100" : "opacity-0",
        )}
      >
        │ Initialize a new Languine configuration
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 0 ? "opacity-100" : "opacity-0",
        )}
      >
        │ Let's set up your i18n configuration
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 0 ? "opacity-100" : "opacity-0",
        )}
      >
        │
      </span>

      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 1 ? "opacity-100" : "opacity-0",
        )}
      >
        ◇ What is your source language?
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 1 ? "opacity-100" : "opacity-0",
        )}
      >
        │ English
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 1 ? "opacity-100" : "opacity-0",
        )}
      >
        │
      </span>

      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 2 ? "opacity-100" : "opacity-0",
        )}
      >
        ◇ What languages do you want to translate to?
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 2 ? "opacity-100" : "opacity-0",
        )}
      >
        │ es, pt, fr
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 2 ? "opacity-100" : "opacity-0",
        )}
      >
        │
      </span>

      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 3 ? "opacity-100" : "opacity-0",
        )}
      >
        ◇ Where should language files be stored?
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 3 ? "opacity-100" : "opacity-0",
        )}
      >
        │ src/locales
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 3 ? "opacity-100" : "opacity-0",
        )}
      >
        │
      </span>

      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        ◇ What format should language files use?
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ● TypeScript (.ts)
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ JSON (.json)
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ Markdown (.md)
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ Xcode Strings (.strings)
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ Xcode Stringsdict (.stringsdict)
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ Xcode XCStrings (.xcstrings)
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ YAML (.yml)
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ Gettext (.po)
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ Android (.xml)
      </span>

      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 4 ? "opacity-100" : "opacity-0",
        )}
      >
        │
      </span>

      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 5 ? "opacity-100" : "opacity-0",
        )}
      >
        ◇ Which provider would you like to use?
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 5 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ● OpenAI
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 5 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ Ollama
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 6 ? "opacity-100" : "opacity-0",
        )}
      >
        ◇ Which model should be used for translations?
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 6 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ● GPT-4 (Default)
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 6 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ GPT-4 Turbo
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 6 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ GPT-4o
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 6 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ GPT-4o mini
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 6 ? "opacity-100" : "opacity-0",
        )}
      >
        │ ○ GPT-3.5 Turbo
      </span>
      <span
        className={cn(
          "transition-opacity duration-100",
          step >= 6 ? "opacity-100" : "opacity-0",
        )}
      >
        │
      </span>
      <span
        className={cn(
          "transition-opacity duration-100 -ml-[1.5px]",
          step >= 7 ? "opacity-100" : "opacity-0",
        )}
      >
        └ Configuration file and language files created successfully!
      </span>
    </div>
  );
}
