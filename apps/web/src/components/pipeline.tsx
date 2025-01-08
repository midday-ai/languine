"use client";

import { useI18n } from "@/locales/client";

export function Pipeline() {
  const t = useI18n();

  return (
    <div>
      <h2 className="text-2xl font-medium mb-4">
        {t("pipeline.title")}{" "}
        <span className="text-secondary text-sm relative -top-2">
          {t("pipeline.pro")}
        </span>
      </h2>
      <p className="text-secondary">{t("pipeline.description")}</p>

      <div className="flex flex-col items-center justify-center p-4 mt-10 h-[400px] sm:h-[500px] md:h-[600px]">
        <pre
          className="p-4 text-sm leading-5 scale-[0.5] sm:scale-[0.65] md:scale-90 transform-gpu"
          style={{
            fontFamily: "monospace",
            whiteSpace: "pre",
            textAlign: "left",
          }}
        >
          {`
                                  ┌───────────────┐
                                  │   Git Push    │
                                  └───────────────┘
                                          │
                                          ▼
             ┌─────────────────────────────────────────────────────────┐
             │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
             │░░░░░░░░░░░░░░░░░░░░ Languine Engine ░░░░░░░░░░░░░░░░░░░░│
             │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
             └─────────────────────────────────────────────────────────┘
                                          │
                                          ▼
                                          │
            ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
           │                              │                              │
           ▼                              ▼                              ▼
 ╔═══════════════════╗          ╔═══════════════════╗          ╔═══════════════════╗
 ║                   ║          ║                   ║          ║                   ║
 ║      English      ║          ║      Spanish      ║          ║      Japanese     ║
 ║    Translation    ║          ║    Translation    ║          ║     Translation   ║
 ║                   ║          ║                   ║          ║                   ║
 ║                   ║          ║                   ║          ║                   ║
 ╚═══════════════════╝          ╚═══════════════════╝          ╚═══════════════════╝
           │                              │                              │
           └──────────────────────────────┼──────────────────────────────┘
                                          ▼
                                  ┌───────────────┐
                                  │     Merge     │
                                  │ Pull Request  │
                                  └───────────────┘
                                          │
                                          ▼
                              ┌─────────────────────┐
                              │      Completed      │
                              │      (Deploy)       │
                              └─────────────────────┘
`}
        </pre>
      </div>
    </div>
  );
}
