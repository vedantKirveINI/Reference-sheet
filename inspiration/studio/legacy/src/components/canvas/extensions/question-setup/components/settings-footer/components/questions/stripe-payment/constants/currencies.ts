export type CurrencyOption = {
  code: string;
  name: string;
};

export const DEFAULT_CURRENCY = "USD";

export const STRIPE_PAYMENT_CURRENCIES: CurrencyOption[] = [
  { code: "EUR", name: "EUR (Euro)" },
  { code: "GBP", name: "GBP (British Pound Sterling)" },
  { code: "USD", name: "USD (United States Dollar)" },
  { code: "AUD", name: "AUD (Australian Dollar)" },
  { code: "CAD", name: "CAD (Canadian Dollar)" },
  { code: "CHF", name: "CHF (Swiss Franc)" },
  { code: "NOK", name: "NOK (Norwegian Krone)" },
  { code: "SEK", name: "SEK (Swedish Krona)" },
  { code: "DKK", name: "DKK (Danish Krone)" },
  { code: "MXN", name: "MXN (Mexican Peso)" },
  { code: "NZD", name: "NZD (New Zealand Dollar)" },
  { code: "BRL", name: "BRL (Brazilian Real)" },
];
