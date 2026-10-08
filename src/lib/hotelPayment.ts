import type { BookingRecord } from "@/src/lib/hotelBookingHistory";

/** Share of the total taken online to confirm a booking; the rest is paid at the hotel. */
export const DEPOSIT_RATE = 0.2;

export const paymentPlans = ["deposit", "full"] as const;
export type PaymentPlan = (typeof paymentPlans)[number];

export const onlinePaymentMethods = ["bkash", "nagad", "rocket", "card"] as const;
export type OnlinePaymentMethod = (typeof onlinePaymentMethods)[number];

/** Methods offered at checkout, plus the ones older saved bookings may still carry. */
export const paymentMethodInfo: Record<string, { label: string; detail: string; logos: string[] }> = {
  bkash: { label: "bKash", detail: "Mobile wallet", logos: ["/payments/bkash.webp"] },
  nagad: { label: "Nagad", detail: "Mobile wallet", logos: ["/payments/nagad.webp"] },
  rocket: { label: "Rocket", detail: "Mobile wallet", logos: ["/payments/rocket.webp"] },
  card: { label: "Card", detail: "Visa · Mastercard", logos: ["/payments/visa.svg", "/payments/mastercard.svg"] },
  hotel: { label: "Pay at hotel", detail: "Cash or card on arrival", logos: [] },
  wallet: { label: "Mobile wallet", detail: "bKash · Nagad · Rocket", logos: [] },
};

// Whole taka, rounded up so the deposit never falls below 20%.
export const depositAmount = (total: number) => Math.ceil(total * DEPOSIT_RATE);

export const amountDueNow = (total: number, plan: PaymentPlan) =>
  plan === "full" ? total : depositAmount(total);

/** What was paid online and what's left for the front desk. Bookings made before deposits existed paid nothing online. */
export function bookingPayment(booking: Pick<BookingRecord, "total" | "paymentPlan" | "amountPaid" | "paymentMethod">) {
  const paid = booking.amountPaid ?? 0;
  const balance = Math.max(0, booking.total - paid);
  const method = paymentMethodInfo[booking.paymentMethod ?? "hotel"] ?? paymentMethodInfo.hotel;
  const status =
    paid >= booking.total ? "Paid in full" : paid > 0 ? "Deposit paid" : booking.paymentMethod === "hotel" || !booking.paymentMethod ? "Due on arrival" : "Awaiting payment";
  return { paid, balance, method, status, fullyPaid: balance === 0 };
}
