import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    switch (payload.type) {
      case "subscription.created":
        // Handle the subscription created event
        break;
      case "subscription.updated":
        // Handle the subscription updated event
        break;
      case "subscription.active":
        // Handle the subscription active event
        break;
      case "subscription.canceled":
        // Handle the subscription canceled event
        break;
      default:
        console.log("Unknown event", payload.type);
        break;
    }
  },
});
