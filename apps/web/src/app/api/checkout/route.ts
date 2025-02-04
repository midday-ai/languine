import { api } from "@/lib/polar";
import { geolocation } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const productId = req.nextUrl.searchParams.get("productId");
  const redirectPath = req.nextUrl.searchParams.get("redirectPath");
  const customerId = req.nextUrl.searchParams.get("customerId");
  const customerEmail = req.nextUrl.searchParams.get("customerEmail");
  const customerName = req.nextUrl.searchParams.get("customerName");
  const organizationId = req.nextUrl.searchParams.get("organizationId");

  const { country } = geolocation(req);

  if (!productId || !organizationId) {
    return NextResponse.json(
      { error: "Product ID and organization ID are required" },
      { status: 400 },
    );
  }

  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}?tab=billing`;

  const checkout = await api.checkouts.custom.create({
    productId: productId,
    successUrl,
    customerId: customerId ?? undefined,
    customerEmail: customerEmail ?? undefined,
    customerName: customerName ?? undefined,
    customerBillingAddress: {
      country: country ?? "SE",
    },
    metadata: {
      organizationId,
    },
  });

  return NextResponse.redirect(checkout.url);
};
