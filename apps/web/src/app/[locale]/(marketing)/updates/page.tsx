import { PackageManagerProvider } from "@/components/package-manager-context";
import { getUpdates } from "@/lib/markdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Updates",
  description: "Latest updates and announcements from Languine",
};

interface Update {
  slug: string;
  frontmatter: {
    title: string;
    description: string;
    date: string;
  };
}

export default async function Page() {
  const updates = await getUpdates();

  return (
    <PackageManagerProvider>
      <div className="container mx-auto max-w-screen-md px-4 py-16 space-y-24">
        {updates}
      </div>
    </PackageManagerProvider>
  );
}
