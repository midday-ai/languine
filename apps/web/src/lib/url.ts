export function getAppUrl() {
  if (!process.env.VERCEL_URL) {
    return "http://localhost:3000";
  }

  return process.env.VERCEL_URL;
}
