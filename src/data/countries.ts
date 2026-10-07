import type { CurrencyCode } from "@/src/lib/currency";

export interface Country {
  code: string;
  name: string;
  /** International dialling code without the "+". */
  dial: string;
  /** Currency used for the "approximately" total in the booking summary. */
  currency: CurrencyCode;
}

// Bangladesh first, then the countries most of our international guests come from.
// "OTHER" in the forms covers everyone else.
export const countries: Country[] = [
  { code: "BD", name: "Bangladesh", dial: "880", currency: "BDT" },
  { code: "IN", name: "India", dial: "91", currency: "INR" },
  { code: "NP", name: "Nepal", dial: "977", currency: "USD" },
  { code: "BT", name: "Bhutan", dial: "975", currency: "USD" },
  { code: "LK", name: "Sri Lanka", dial: "94", currency: "USD" },
  { code: "PK", name: "Pakistan", dial: "92", currency: "USD" },
  { code: "MM", name: "Myanmar", dial: "95", currency: "USD" },
  { code: "CN", name: "China", dial: "86", currency: "USD" },
  { code: "JP", name: "Japan", dial: "81", currency: "USD" },
  { code: "KR", name: "South Korea", dial: "82", currency: "USD" },
  { code: "MY", name: "Malaysia", dial: "60", currency: "USD" },
  { code: "SG", name: "Singapore", dial: "65", currency: "USD" },
  { code: "TH", name: "Thailand", dial: "66", currency: "USD" },
  { code: "ID", name: "Indonesia", dial: "62", currency: "USD" },
  { code: "AE", name: "United Arab Emirates", dial: "971", currency: "USD" },
  { code: "SA", name: "Saudi Arabia", dial: "966", currency: "USD" },
  { code: "QA", name: "Qatar", dial: "974", currency: "USD" },
  { code: "KW", name: "Kuwait", dial: "965", currency: "USD" },
  { code: "TR", name: "Türkiye", dial: "90", currency: "EUR" },
  { code: "GB", name: "United Kingdom", dial: "44", currency: "GBP" },
  { code: "IE", name: "Ireland", dial: "353", currency: "EUR" },
  { code: "DE", name: "Germany", dial: "49", currency: "EUR" },
  { code: "FR", name: "France", dial: "33", currency: "EUR" },
  { code: "IT", name: "Italy", dial: "39", currency: "EUR" },
  { code: "ES", name: "Spain", dial: "34", currency: "EUR" },
  { code: "NL", name: "Netherlands", dial: "31", currency: "EUR" },
  { code: "SE", name: "Sweden", dial: "46", currency: "EUR" },
  { code: "US", name: "United States", dial: "1", currency: "USD" },
  { code: "CA", name: "Canada", dial: "1", currency: "USD" },
  { code: "AU", name: "Australia", dial: "61", currency: "USD" },
  { code: "NZ", name: "New Zealand", dial: "64", currency: "USD" },
];

export const getCountry = (code: string) => countries.find((country) => country.code === code);
