export function Pipeline() {
  return (
    <div>
      <h2 className="text-2xl font-medium mb-4">
        Workflow (CI/CD Pipeline){" "}
        <span className="text-secondary text-sm relative -top-2"> [pro]</span>
      </h2>
      <p className="text-secondary">
        Our translation engine seamlessly integrates into your existing CI/CD
        pipeline, automatically translating your codebase on every push. When
        code changes are pushed, we analyze the modified content, maintain your
        translation memory, and generate accurate translations while preserving
        your brand voice and terminology. The translations are then submitted as
        pull requests, allowing for review before being merged into your main
        branch and deployed. This automated workflow ensures your localized
        content stays in sync with development.
      </p>

      <div className="flex flex-col items-center justify-center min-h-screenp-4 mt-10">
        <pre
          style={{
            fontFamily: "monospace",
            whiteSpace: "pre",
            display: "block",
            padding: "1em",
            overflow: "auto",
            textAlign: "left",
            margin: "0 auto",
            fontSize: "14px",
            lineHeight: "1.2",
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
