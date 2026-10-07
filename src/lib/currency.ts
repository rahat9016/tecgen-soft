// Indicative BDT → currency rates, for the "approximately" line only. Bookings are always
// charged in BDT. Update these periodically, or swap in a live rates API.
export const BDT_RATES = {
  BDT: 1,
  USD: 0.0082,
  EUR: 0.0075,
  GBP: 0.0064,
  INR: 0.7,
} as const;

export type CurrencyCode = keyof typeof BDT_RATES;

export const currencyCodes = Object.keys(BDT_RATES) as CurrencyCode[];

export const formatInCurrency = (amountBdt: number, currency: CurrencyCode) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "BDT" || currency === "INR" ? 0 : 2,
  }).format(amountBdt * BDT_RATES[currency]);
