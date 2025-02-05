// @ts-nocheck
import { CopyButton } from "@/components/copy-button";
import { PackageManagerTabs } from "@/components/package-manager-tabs";
import { Link } from "@/i18n/routing";
import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";
import { createHighlighter } from "shiki";

// Helper to detect if a command is a package manager command
function getPackageManagerCommandType(code: string) {
  const command = code.trim();

  // Handle npx commands
  if (command.startsWith("npx ")) {
    return {
      type: "exec" as const,
      command: command.replace(/^npx\s+/, ""),
    };
  }

  if (!command.startsWith("pm")) {
    return null;
  }

  // Extract the command after "pm", e.g. "pm install react" -> "install react"
  const pmCommand = command.slice(2).trim();

  // If empty command after pm, ignore
  if (!pmCommand) {
    return null;
  }

  // Match the command type
  if (pmCommand.startsWith("install") || pmCommand.startsWith("i ")) {
    return {
      type: "install" as const,
      command: pmCommand.replace(/^(install|i)\s+/, ""),
    };
  }
  if (pmCommand.startsWith("add -D") || pmCommand.startsWith("install -D")) {
    return {
      type: "dev" as const,
      command: pmCommand.replace(/^(add -D|install -D)\s+/, ""),
    };
  }
  if (pmCommand.startsWith("run")) {
    return { type: "run" as const, command: pmCommand.replace(/^run\s+/, "") };
  }
  if (pmCommand.startsWith("exec") || pmCommand.startsWith("x ")) {
    return {
      type: "exec" as const,
      command: pmCommand.replace(/^(exec|x)\s+/, ""),
    };
  }

  // If no specific command type is matched, treat it as a package install
  // This handles cases like "pm react" or "pm @types/react@latest"
  return {
    type: "install" as const,
    command: pmCommand,
  };
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: function H1({ className = "", children, ...props }) {
      return (
        <h1
          className={`scroll-m-20 text-xl tracking-tight mb-6 ${className}`}
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: function H2({ className = "", children, ...props }) {
      return (
        <h2 className={`tracking-tight text-lg mb-4 ${className}`} {...props}>
          {children}
        </h2>
      );
    },
    h3: function H3({ className = "", children, ...props }) {
      return (
        <h3 className={`tracking-tight text-sm mb-2 ${className}`} {...props}>
          {children}
        </h3>
      );
    },
    h4: function H4({ className = "", children, ...props }) {
      return (
        <h4 className={`tracking-tight ${className}`} {...props}>
          {children}
        </h4>
      );
    },
    p: function P({ className = "", children, ...props }) {
      return (
        <p
          className={`leading-7 text-secondary text-sm [&:not(:first-child)]:mt-6 mb-6 ${className}`}
          {...props}
        >
          {children}
        </p>
      );
    },
    ul: function UL({ className = "", children, ...props }) {
      return (
        <ul
          className={`my-6 ml-6 mb-6 list-disc text-sm text-secondary [&>li]:mt-2 ${className}`}
          {...props}
        >
          {children}
        </ul>
      );
    },
    ol: function OL({ className = "", children, ...props }) {
      return (
        <ol
          className={`my-6 ml-6 mb-6 list-decimal text-sm text-secondary [&>li]:mt-2 ${className}`}
          {...props}
        >
          {children}
        </ol>
      );
    },
    li: function LI({ className = "", children, ...props }) {
      return (
        <li
          className={`leading-7 text-sm text-secondary flex items-start gap-2 ${className}`}
          {...props}
        >
          <span>◇</span>
          <span>{children}</span>
        </li>
      );
    },
    hr: function HR({ className = "", ...props }) {
      return <hr className={`py-6 ${className}`} {...props} />;
    },
    blockquote: function Blockquote({ className = "", children, ...props }) {
      return (
        <blockquote
          className={`mt-6 border-l-2 border-gray-300 pl-6 italic text-gray-800 dark:text-gray-200 ${className}`}
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    a: function A({ className = "", children, ...props }) {
      return (
        <Link
          className={`text-primary underline underline-offset-4 hover:text-primary/80 ${className}`}
          {...props}
        >
          {children}
        </Link>
      );
    },
    img: function Img(props) {
      return (
        <Image
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          {...(props as ImageProps)}
        />
      );
    },
    pre: function Pre({ className = "", children, title, ...props }) {
      const lang = className?.replace("language-", "") || "typescript";

      return (
        <div className="pt-2 pb-8">
          <div className="relative group overflow-hidden border border-border bg-[#0C0C0C] bg-noise">
            <div className="flex items-center justify-between px-4 py-2 bg-[#1C1C1C] border-b border-border">
              <div className="flex items-center gap-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    {title ? title : lang}
                  </span>
                </div>
              </div>
            </div>
            <pre
              className={`mb-4 mt-2 overflow-x-auto relative ${className}`}
              {...props}
            >
              {children}
            </pre>
          </div>
        </div>
      );
    },
    code: async function Code({ className = "", children, title, ...props }) {
      const isInline = !children?.toString().includes("\n");
      const code = children?.toString() || "";
      const lang = className?.replace("language-", "") || "typescript";

      if (isInline) {
        return (
          <code
            className={`rounded border-b-2 border-gray-200 border-dashed px-[0.3rem] py-[0.2rem] font-mono text-sm ${className}`}
            {...props}
          >
            {children}
          </code>
        );
      }

      const highlighter = await createHighlighter({
        themes: [
          {
            name: "languine-dark",
            type: "dark",
            settings: [
              {
                settings: {
                  background: "transparent",
                  foreground: "#D4D4D4",
                  caret: "#FFFFFF",
                  selection: "#264F78",
                  lineHighlight: "#1F1F1F",
                },
              },
            ],
            tokenColors: [
              {
                scope: ["keyword", "storage.type", "storage.modifier"],
                settings: { foreground: "#569CD6" },
              },
              {
                scope: ["string", "string.template"],
                settings: { foreground: "#CE9178" },
              },
              {
                scope: ["constant.numeric", "constant.language"],
                settings: { foreground: "#B5CEA8" },
              },
              {
                scope: ["variable", "variable.parameter", "variable.other"],
                settings: { foreground: "#9CDCFE" },
              },
              {
                scope: [
                  "entity.name.function",
                  "support.function",
                  "meta.function-call",
                ],
                settings: { foreground: "#DCDCAA" },
              },
              {
                scope: ["comment"],
                settings: { foreground: "#6A9955", fontStyle: "italic" },
              },
              {
                scope: ["punctuation", "meta.brace"],
                settings: { foreground: "#D4D4D4" },
              },
              {
                scope: ["entity.name.type", "support.type"],
                settings: { foreground: "#4EC9B0" },
              },
              {
                scope: ["constant.language.import-export-all"],
                settings: { foreground: "#D4D4D4" },
              },
              {
                scope: ["meta.object-literal.key", "variable.object.property"],
                settings: { foreground: "#9CDCFE" },
              },
            ],
          },
        ],
        langs: ["typescript", "javascript", "jsx", "tsx", "bash", "json"],
      });

      const html = highlighter.codeToHtml(code, {
        lang,
        theme: "languine-dark",
      });

      const pmCommand =
        lang === "bash" ? getPackageManagerCommandType(code) : null;

      return (
        <div className="px-4 ">
          <div className="absolute right-3" style={{ top: "-38px" }}>
            <CopyButton code={code} />
          </div>

          {pmCommand ? (
            <PackageManagerTabs
              code={pmCommand.command}
              type={pmCommand.type}
              showCopy={false}
            />
          ) : (
            <div
              className={`${className} font-mono text-sm`}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      );
    },
    table: function Table({ className = "", children, ...props }) {
      return (
        <div className="my-6 w-full overflow-y-auto">
          <table
            className={`w-full border-collapse text-sm ${className}`}
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },
    thead: function THead({ className = "", children, ...props }) {
      return (
        <thead className={`bg-muted/50 ${className}`} {...props}>
          {children}
        </thead>
      );
    },
    tbody: function TBody({ className = "", children, ...props }) {
      return (
        <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
          {children}
        </tbody>
      );
    },
    tr: function TR({ className = "", children, ...props }) {
      return (
        <tr
          className={`border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
          {...props}
        >
          {children}
        </tr>
      );
    },
    th: function TH({ className = "", children, ...props }) {
      return (
        <th
          className={`h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className}`}
          {...props}
        >
          {children}
        </th>
      );
    },
    td: function TD({ className = "", children, ...props }) {
      return (
        <td
          className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className}`}
          {...props}
        >
          {children}
        </td>
      );
    },
    ...components,
  };
}
