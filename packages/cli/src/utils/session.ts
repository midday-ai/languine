import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

interface LanguineSession {
  id: string;
  name: string;
  email: string;
  apiKey: string;
}

const SESSION_FILE = join(homedir(), ".languine");

export function saveSession(sessionData: LanguineSession): void {
  writeFileSync(SESSION_FILE, JSON.stringify(sessionData), { mode: 0o600 });
}

export function loadSession(): LanguineSession | null {
  if (existsSync(SESSION_FILE)) {
    try {
      return JSON.parse(readFileSync(SESSION_FILE, "utf-8"));
    } catch (error) {
      return null;
    }
  }

  return null;
}

export function clearSession(): void {
  if (existsSync(SESSION_FILE)) {
    unlinkSync(SESSION_FILE);
  }
}

export function getAPIKey(): string | null {
  const session = loadSession();

  if (!session) {
    return null;
  }

  return session.apiKey;
}
