"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function Install() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("npx languine@latest");
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="font-mono space-y-8">
      <h2 className="text-lg font-medium">Getting started</h2>
      <div className="text-sm font-mono">
        <p>Install Languine CLI</p>

        <div className="flex items-center mt-4 space-x-2">
          <span className="text-primary">$ npx languine@latest</span>
          <button
            type="button"
            onClick={copyCommand}
            className="active:scale-90 transition-transform"
          >
            {copied ? (
              <Check className="size-4 transition-colors" />
            ) : (
              <Copy className="size-4 hover:text-primary transition-colors" />
            )}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium">CLI</h2>
        <pre className="text-xs font-mono mt-4">
          <code>{`init          Initialize a new Languine configuration
init          --preset <preset>  Initialize a new Languine configuration with a preset
translate     Translate to all target locales
translate     <locale>    Translate to a specific locale
translate     --force     Force translate all keys
instructions  Add custom translation instructions
diff          Check for changes in source locale file
clean         Clean unused translations
available     Show available commands
Run languine <command> to execute a command`}</code>
        </pre>
      </div>

      <div>
        <h2 className="text-lg font-medium">
          Github Actions{" "}
          <span className="text-xs text-muted-foreground">(Coming soon)</span>
        </h2>
        <pre className="text-xs font-mono mt-4">
          <code>{`jobs:
  translate:
    name: Run translation
    runs-on: ubuntu-latest
    permissions:
      actions: write
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - name: Languine
        uses: midday-ai/languine@main
        env:
          GH_TOKEN: \${{ github.token }}
        with:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
`}</code>
        </pre>
      </div>
    </div>
  );
}
