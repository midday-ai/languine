import { headers } from "next/headers";

export const getCookieHeaders = async () => {
  const headersList = await headers();
  const cookie = headersList.get("cookie");

  const requestHeaders: HeadersInit = {};
  if (cookie) {
    requestHeaders.cookie = cookie;
  }

  return requestHeaders;
};
