import Login from "@/components/login";
import { getOrganization } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function Page() {
  const org = await getOrganization();

  if (org.data) {
    redirect(`/${org.data.slug}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center max-w-sm mx-auto">
      <Login />
    </div>
  );
}
