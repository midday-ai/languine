"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function Terminal() {
  const [step, setStep] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev < 11) {
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
    <div className="max-w-3xl w-full border border-border p-4 bg-[#121212] relative font-mono bg-noise overflow-hidden">
      <div className="select-none">
        <div className="flex gap-2 pb-4 bg-[#121212] bg-noise">
          <div className="w-3.5 h-3.5 rounded-full bg-primary" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#878787]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#2C2C2C]" />
        </div>
      </div>

      <div
        ref={terminalRef}
        className="overflow-auto max-h-[380px] md:max-h-[520px] text-[#F5F5F3] scroll-smooth"
      >
        <div className="text-xs flex flex-col tracking-wide leading-relaxed space-y-0.5">
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
                  className={`inline-block w-1 h-4 bg-[#F5F5F3] ml-2 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
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
                  className={`inline-block w-1 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
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
                  className={`inline-block w-1 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
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
                  className={`inline-block w-1 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
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
            │ src/locales/[locale].json
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
                  className={`inline-block w-1 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
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
            │ ○ YAML (.yml, .yaml)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ Java Properties (.properties)
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
            │ ○ iOS Strings (.strings)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ iOS Stringsdict (.stringsdict)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ iOS XCStrings (.xcstrings)
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
            │ ○ MDX (.mdx)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ HTML (.html)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ JavaScript (.js)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ Gettext PO (.po)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ XLIFF (.xlf, .xliff)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ CSV (.csv)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ XML (.xml)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ Flutter ARB (.arb)
          </span>
          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 4 ? "opacity-100" : "opacity-0",
            )}
          >
            │ ○ PHP (.php)
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
              "transition-opacity duration-100 -ml-[1.5px] flex",
              step >= 5 ? "opacity-100" : "opacity-0",
            )}
          >
            <span>
              └ Configuration file and language files created successfully!
            </span>
          </span>

          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 5 ? "opacity-100" : "opacity-0",
            )}
          >
            │
          </span>

          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 6 ? "opacity-100" : "opacity-0",
              "flex mt-4",
            )}
          >
            <span>
              ◇ languine translate
              {step === 6 && (
                <span
                  className={`inline-block w-1 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                >
                  █
                </span>
              )}
            </span>
          </span>

          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 7 ? "opacity-100" : "opacity-0",
            )}
          >
            │ Translating to Spanish (es)...
          </span>

          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 8 ? "opacity-100" : "opacity-0",
            )}
          >
            │ Translating to Portuguese (pt)...
          </span>

          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 9 ? "opacity-100" : "opacity-0",
            )}
          >
            │ Translating to French (fr)...
          </span>

          <span
            className={cn(
              "transition-opacity duration-100",
              step >= 10 ? "opacity-100" : "opacity-0",
            )}
          >
            │
          </span>

          <span
            className={cn(
              "transition-opacity duration-100 -ml-[1.5px]",
              step >= 11 ? "opacity-100" : "opacity-0",
              "flex",
            )}
          >
            <span>
              └ Successfully translated to 3 languages!
              {step === 11 && (
                <span
                  className={`inline-block w-1 h-4 bg-[#F5F5F3] ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
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
