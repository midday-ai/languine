// biome-ignore format: ascii art needs specific formatting
export function Pipeline() {
  return (
    <div className="max-w-7xl mx-auto">
      <pre className="font-mono text-xs sm:text-sm md:text-base lg:text-lg whitespace-pre overflow-x-auto">
        {`
                                    ┌───────────────┐
                                    │   Git Push    │ 
                                    └───────────────┘          
                                            │                                            
                                            ▼                                            
               ┌─────────────────────────────────────────────────────────┐               
               │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│               
               │░░░░░░░░░░░░░░░░░░░░░Languine Engine░░░░░░░░░░░░░░░░░░░░░│               
               │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│               
               └─────────────────────────────────────────────────────────┘   
                                            │                                            
                                            ▼                                            
                                            │                                            
              ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─              
             │                                                             │             
             ▼                              ▼                              ▼             
   ╔═══════════════════╗          ╔═══════════════════╗          ╔═══════════════════╗   
   ║     English       ║          ║     Spanish       ║          ║     Japanese      ║   
   ║    Translation    ║          ║    Translation    ║          ║    Translation    ║   
   ║      Branch       ║          ║      Branch       ║          ║      Branch       ║   
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
                                    ┌───────────────┐
                                    │     Main      │
                                    │    Branch     │
                                    └───────────────┘
        `}
      </pre>
    </div>
  );
}
