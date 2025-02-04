export const TIERS_MAX_KEYS = {
  0: 100,
  1: 10000,
  2: 20000,
  3: 30000,
  4: 50000,
  5: 100000,
  6: 200000,
  7: 500000,
  8: 1000000,
};

export const TIERS_MAX_DOCUMENTS = {
  0: 5,
  1: 50,
  2: 100,
  3: 200,
  4: 500,
  5: 1000,
  6: 2000,
  7: 5000,
  8: 10000,
};

export const TIER_PRICES = {
  1: 49,
  2: 149,
  3: 299,
  4: 499,
  5: 999,
  6: 1999,
  7: 4999,
  8: 9999,
};

export const TIER_MAX_LANGUAGES = {
  0: 4,
  1: 8,
  2: 16,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  7: 56,
  8: 64,
};

export const PRODUCT_ID_MAP_PRODUCTION = {
  1: "1d63b754-06d6-4186-9be5-817e7693264f",
  2: "4dc28104-46d9-42b0-a55f-d96930333ae2",
  3: "be20ddfe-dee7-49ea-9008-3934b01dcb8a",
  4: "6c2929f7-8941-47da-8f45-bd2fe304e384",
  5: "b893ae5d-ae55-42fc-a919-8b7c142cf6be",
  6: "44278d04-34a5-4ad8-9a8d-91b3b90c0b42",
  7: "c7f4e979-6a90-427d-bb5c-3b4dcaa1d5f2",
  8: "70076651-2079-4ecf-ad3a-73294e2a715c",
};

export const PRODUCT_ID_MAP_SANDBOX = {
  1: "2cc94f27-7cfc-40c7-9726-8e94d63fd8e2",
  2: "89689fb1-cde9-474a-b6d1-96b672446c8b",
  3: "cf48e7c3-7ac6-4553-a92e-1054ffb63c27",
  4: "b53ff0db-0a16-4e33-9f98-7c7397fa5048",
  5: "b0350cb1-2304-4a3e-940b-195a2b4a8d4c",
  6: "8e53c58c-1062-47a8-9492-9e29d71acfe4",
  7: "f2875dd4-a214-402c-9c0e-94d0ee25d184",
  8: "23627b2c-70bd-48a4-956c-0306336dbba1",
};

export const PRODUCT_ID_MAP =
  process.env.POLAR_ENVIRONMENT === "production"
    ? PRODUCT_ID_MAP_PRODUCTION
    : PRODUCT_ID_MAP_SANDBOX;

export function getTierFromProductId(productId: string) {
  const tier = Object.entries(PRODUCT_ID_MAP).find(
    ([_, value]) => value === productId,
  )?.[0];

  return tier ? Number.parseInt(tier) : null;
}
