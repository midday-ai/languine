import { getOrganization } from "@/lib/queries";
import { getSession } from "@/lib/session";

export default async function Page() {
  const session = await getSession();
  const org = await getOrganization();

  console.log(org);

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Hello</div>;
}
