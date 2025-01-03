import Header from "@/components/dashboard/header";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.data) {
    redirect("/login");
  }

  return (
    <div>
      <Header />

      {children}
    </div>
  );
}
