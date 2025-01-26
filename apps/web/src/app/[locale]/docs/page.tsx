import { getMarkdownContent } from "@/lib/markdown";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  try {
    const content = await getMarkdownContent(locale, "introduction");
    return content;
  } catch (error) {
    notFound();
  }
}
