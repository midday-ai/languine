export function getAppUrl() {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return "https://languine.ai";
}
