import Login from "@/components/login";
import { Logo } from "@/components/logo";
import StackedCode from "@/components/stacked-code";
import { getOrganization } from "@/lib/queries";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const org = await getOrganization();

  if (org.data) {
    redirect(`/${org.data.slug}`);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="absolute top-6 left-6 mt-[1px]">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <div className="hidden lg:flex items-center justify-center border-r border-border">
        <div className="w-full">
          <h2 className="text-2xl text-center">Automate your localization.</h2>

          <div className="mt-24 w-full relative">
            <div className="w-[80%] mx-auto">
              <StackedCode />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 lg:p-8 bg-noise">
        <div className="w-full max-w-sm">
          <Login />
        </div>
      </div>
    </div>
  );
}
