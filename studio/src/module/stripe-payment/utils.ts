import { loadStripe, Stripe } from "@stripe/stripe-js";

export const getStripePromise = (
  stripe_publishable_key: string
): Promise<Stripe | null> => {
  if (!stripe_publishable_key) {
    throw new Error("Stripe publishable key is required");
  }
  return loadStripe(stripe_publishable_key);
};

/**
 * Mapping of currency codes to their decimal places
 * Based on Stripe's supported currencies
 */
const CURRENCY_DECIMAL_PLACES: Record<string, number> = {
  // Zero decimal places (multiply by 1)
  JPY: 0, // Japanese Yen
  KRW: 0, // South Korean Won
  VND: 0, // Vietnamese Dong
  CLP: 0, // Chilean Peso
  UGX: 0, // Ugandan Shilling
  XAF: 0, // Central African CFA Franc
  XOF: 0, // West African CFA Franc
  BIF: 0, // Burundian Franc
  DJF: 0, // Djiboutian Franc
  GNF: 0, // Guinean Franc
  KMF: 0, // Comorian Franc
  MGA: 0, // Malagasy Ariary
  RWF: 0, // Rwandan Franc
  VUV: 0, // Vanuatu Vatu
  XPF: 0, // CFP Franc

  // Three decimal places (multiply by 1000)
  BHD: 3, // Bahraini Dinar
  JOD: 3, // Jordanian Dinar
  KWD: 3, // Kuwaiti Dinar
  OMR: 3, // Omani Rial
  TND: 3, // Tunisian Dinar

  // Two decimal places (multiply by 100) - default for all other currencies
  // Including: USD, EUR, GBP, AUD, CAD, CHF, NOK, SEK, DKK, MXN, NZD, BRL, INR, etc.
};

/**
 * Gets the number of decimal places for a given currency code
 * @param currency - Currency code (e.g., "USD", "JPY", "BHD")
 * @returns Number of decimal places (0, 2, or 3). Defaults to 2 if currency not found.
 */
export const getCurrencyDecimalPlaces = (currency: string): number => {
  const normalizedCurrency = currency.toUpperCase();
  return CURRENCY_DECIMAL_PLACES[normalizedCurrency] ?? 2;
};

/**
 * Converts an amount to the smallest currency unit based on the currency's decimal places
 * @param amount - The amount in the currency's standard unit (e.g., 10.50 for USD)
 * @param currency - Currency code (e.g., "USD", "JPY", "BHD")
 * @returns The amount in the smallest currency unit (e.g., 1050 cents for USD 10.50)
 */
export const convertAmountToSmallestUnit = (
  amount: number,
  currency: string
): number => {
  const decimalPlaces = getCurrencyDecimalPlaces(currency);
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(amount * multiplier);
};

export type CreatePaymentIntentParams = {
  amount: number;
  currency: string;
  accessToken: string;
  receiptEmail?: string;
};

export const createPaymentIntent = async ({
  amount,
  currency,
  accessToken,
  receiptEmail,
}: CreatePaymentIntentParams): Promise<string> => {
  // Convert amount to smallest currency unit based on currency decimal places
  const amountInSmallestUnit = convertAmountToSmallestUnit(amount, currency);

  // Prepare form data
  const formData = new URLSearchParams();
  formData.append("amount", amountInSmallestUnit.toString());
  formData.append("currency", currency.toLowerCase());
  formData.append("automatic_payment_methods[enabled]", "true");

  if (receiptEmail) {
    formData.append("receipt_email", receiptEmail);
  }

  const response = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        `Failed to create payment intent: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.client_secret;
};
