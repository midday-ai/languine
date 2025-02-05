import { getMarkdownContent } from "@/lib/markdown";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: { params: Promise<{ all: string[] }> }) {
  const { all } = await params;

  try {
    const content = await getMarkdownContent("en", all?.at(0) ?? "");
    return content;
  } catch (error) {
    notFound();
  }
}
