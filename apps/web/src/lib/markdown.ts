import fs from "node:fs/promises";
import path from "node:path";
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
  const docPath = await getCurrentDoc(locale, slug);
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
