import { intro, outro } from "@clack/prompts";
import { clearSession, loadSession } from "../../utils/session.js";

export async function logoutCommand() {
  intro("Logout from Languine");

  const session = loadSession();

  if (!session) {
    outro("You are not logged in.");
    return;
  }

  clearSession();
  outro("Successfully logged out");
}
