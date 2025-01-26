import { createClient } from "../client/server";

export async function getSession() {
  const supabase = await createClient();

  return supabase.auth.getSession();
}
