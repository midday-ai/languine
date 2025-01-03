import { headers } from "next/headers";
import { auth } from "./auth";

export const getOrganization = async () => {
  return auth.organization.getFullOrganization({
    fetchOptions: {
      headers: await headers(),
    },
  });
};
