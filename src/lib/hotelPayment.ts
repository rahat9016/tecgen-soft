import type { OnlineMethod, PaymentPlan } from "@/src/lib/hotel-store/types";

export const paymentPlans = ["deposit", "full"] as const satisfies readonly PaymentPlan[];
export type { PaymentPlan };

export const onlinePaymentMethods = ["bkash", "nagad", "rocket", "card"] as const satisfies readonly OnlineMethod[];
export type OnlinePaymentMethod = OnlineMethod;

/** Labels and logos for every method a folio can carry. */
export const paymentMethodInfo: Record<string, { label: string; detail: string; logos: string[] }> = {
  bkash: { label: "bKash", detail: "Mobile wallet", logos: ["/payments/bkash.webp"] },
  nagad: { label: "Nagad", detail: "Mobile wallet", logos: ["/payments/nagad.webp"] },
  rocket: { label: "Rocket", detail: "Mobile wallet", logos: ["/payments/rocket.webp"] },
  card: { label: "Card", detail: "Visa · Mastercard", logos: ["/payments/visa.svg", "/payments/mastercard.svg"] },
  cash: { label: "Cash", detail: "Paid at the front desk", logos: [] },
  bank: { label: "Bank transfer", detail: "BEFTN / NPSB", logos: [] },
};
