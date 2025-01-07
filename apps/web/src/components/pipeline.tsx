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

      <div className="flex flex-col items-center justify-center min-h-screen p-4 mt-10">
        <pre
          className="overflow-auto p-4 text-sm leading-5 max-w-full"
          style={{
            fontFamily: "monospace",
            whiteSpace: "pre",
            textAlign: "left",
            margin: "0 auto",
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