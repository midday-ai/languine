import fs from "node:fs/promises";
import path from "node:path";
import { DottedSeparator } from "@/components/dotted-separator";
import { useMDXComponents } from "@/mdx-components";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeMdxCodeProps from "rehype-mdx-code-props";

export function getDocsDir(locale: string) {
  return path.join(process.cwd(), "src", "markdown", "docs", locale);
}

export async function getCurrentDoc(locale: string, slug: string) {
  return path.join(getDocsDir(locale), `${slug}.mdx`);
}

export async function getMarkdownContent(locale: string, slug: string) {
  const docPath = await getCurrentDoc("en", slug);
  const source = await fs.readFile(docPath, "utf-8");
  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: { rehypePlugins: [rehypeMdxCodeProps] },
    },
    components: useMDXComponents({}),
  });

  return content;
}

export async function getUpdates() {
  const updatesDir = path.join(process.cwd(), "src", "markdown", "updates");
  const updates = await fs.readdir(updatesDir);

  const updateContents = await Promise.all(
    updates.map(async (update) => {
      const source = await fs.readFile(path.join(updatesDir, update), "utf-8");
      const { frontmatter, content } = await compileMDX({
        source,
        options: {
          parseFrontmatter: true,
          mdxOptions: { rehypePlugins: [rehypeMdxCodeProps] },
        },
        components: useMDXComponents({}),
      });

      return {
        date: new Date(frontmatter.date),
        content,
      };
    }),
  );

  // Sort by date, newest first
  updateContents.sort((a, b) => b.date.getTime() - a.date.getTime());

  return updateContents.map((update, idx) => (
    <div key={idx.toString()}>
      {update.content}
      <div className="mt-24">
        <DottedSeparator />
      </div>
    </div>
  ));
}
