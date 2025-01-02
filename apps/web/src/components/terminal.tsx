"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function Terminal() {
  const [step, setStep] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Blinking cursor effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorTimer);
  }, []);

  // Step through terminal output
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev < 7) {
          // Scroll to bottom when new content appears

          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (step > 3) {
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [step]);

  return (
    <div className="max-w-3xl w-full border border-border p-4 bg-[#121212] relative font-mono">
      <div className="bg-noise select-none">
        <div className="flex gap-2 pb-4 bg-[#121212]">
          <div className="w-3.5 h-3.5 rounded-full bg-primary" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#878787]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#2C2C2C]" />
        </div>
      </div>

      <div
        ref={terminalRef}
        className="overflow-auto max-h-[520px] text-[#F5F5F3] scroll-smooth"
      >
        <div className="text-sm flex flex-col tracking-wide leading-relaxed space-y-0.5">
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
              "flex",
            )}
          >
            <span>
              ◇ What would you like to do?
              {step === 0 && (
                <span
                  className={`inline-block w-2 h-4 bg-[#F5F5F3] ml-2 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                >
                  █
                </span>
              )}
            </span>
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
              "flex",
            )}
          >
            <span>
              ◇ What is your source language?
              {step === 1 && (
                <span
                  className={`inline-block w-2 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                >
                  █
                </span>
              )}
            </span>
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
              "flex",
            )}
          >
            <span>
              ◇ What languages do you want to translate to?
              {step === 2 && (
                <span
                  className={`inline-block w-2 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                >
                  █
                </span>
              )}
            </span>
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
              "flex",
            )}
          >
            <span>
              ◇ Where should language files be stored?
              {step === 3 && (
                <span
                  className={`inline-block w-2 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                >
                  █
                </span>
              )}
            </span>
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
              "flex",
            )}
          >
            <span>
              ◇ What format should language files use?
              {step === 4 && (
                <span
                  className={`inline-block w-2 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                >
                  █
                </span>
              )}
            </span>
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
              "flex",
            )}
          >
            <span>
              ◇ Which provider would you like to use?
              {step === 5 && (
                <span
                  className={`inline-block w-2 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                >
                  █
                </span>
              )}
            </span>
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
              "flex",
            )}
          >
            <span>
              ◇ Which model should be used for translations?
              {step === 6 && (
                <span
                  className={`inline-block w-2 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                >
                  █
                </span>
              )}
            </span>
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
              "transition-opacity duration-100 -ml-[1.5px] flex",
              step >= 7 ? "opacity-100" : "opacity-0",
            )}
          >
            <span>
              └ Configuration file and language files created successfully!
              {step === 7 && (
                <span
                  className={`inline-block w-2 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                >
                  █
                </span>
              )}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
