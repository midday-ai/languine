export function getAppUrl() {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return process.env.BETTER_AUTH_BASE_URL;
}
