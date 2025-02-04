import { PRODUCT_ID_MAP } from "./tiers";

export const buildCheckoutURL = ({
  tier,
  organizationId,
  pathname,
  customerData,
}: {
  tier: number;
  pathname: string;
  organizationId: string;
  customerData?: {
    polarCustomerId?: string;
    email?: string;
    name?: string;
  };
}) => {
  const url = new URL("/api/checkout", process.env.NEXT_PUBLIC_APP_URL);
  const params = new URLSearchParams({
    productId: PRODUCT_ID_MAP[tier as keyof typeof PRODUCT_ID_MAP],
    redirectPath: pathname,
  });

  params.append("organizationId", organizationId);

  if (
    // Only set customerId if we're in production and the customer has a polarCustomerId
    customerData?.polarCustomerId &&
    process.env.POLAR_ENVIRONMENT === "production"
  ) {
    params.append("customerId", customerData.polarCustomerId);
  }

  if (customerData?.email) {
    params.append("customerEmail", customerData.email);
  }

  if (customerData?.name) {
    params.append("customerName", customerData.name);
  }

  url.search = params.toString();

  return url.toString();
};
