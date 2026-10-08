import { format, subDays } from "date-fns";
import type { BookingRecord } from "@/src/lib/hotelBookingHistory";
import { hotel } from "@/src/data/hotels";
import { parseCheckTimes } from "@/src/components/hotel/HotelDetails/PoliciesSection";
import { bookingPayment, DEPOSIT_RATE } from "@/src/lib/hotelPayment";

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
  "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const belowHundred = (n: number) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? `-${ONES[n % 10]}` : ""}`);
const belowThousand = (n: number) =>
  [n >= 100 ? `${ONES[Math.floor(n / 100)]} Hundred` : "", belowHundred(n % 100)].filter(Boolean).join(" ");

/** Bangladeshi numbering (crore / lakh / thousand), as used on Taka invoices. */
export function takaInWords(amount: number) {
  let n = Math.round(amount);
  if (n === 0) return "Zero Taka Only";
  const parts: string[] = [];
  for (const [size, name] of [[10_000_000, "Crore"], [100_000, "Lakh"], [1_000, "Thousand"]] as const) {
    if (n >= size) {
      parts.push(`${n >= size * 100 ? takaInWords(Math.floor(n / size)).replace(/ Taka Only$/, "") : belowHundred(Math.floor(n / size))} ${name}`);
      n %= size;
    }
  }
  if (n) parts.push(belowThousand(n));
  return `${parts.join(" ")} Taka Only`;
}


const money = (amount: number) => amount.toLocaleString("en-US");

export const invoiceNumber = (bookingId: string) => `INV-${bookingId.replace(/^TW-/, "")}`;

/** Print-only A4 invoice. The on-screen confirmation is hidden when printing; this is what lands on paper/PDF. */
export default function PrintableInvoice({ booking }: { booking: BookingRecord }) {
  const { guest } = booking;
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const issued = new Date(booking.createdAt);
  const times = parseCheckTimes(hotel.policies);
  const phoneDisplay = hotel.phone.replace(/^\+880(\d{4})(\d+)$/, "+880 $1-$2");
  const payment = bookingPayment(booking);
  const cancellation = hotel.policies.find((p) => p.toLowerCase().includes("cancellation"));
  const guestsLabel = `${booking.adults} adult${booking.adults !== 1 ? "s" : ""}${
    booking.children ? `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}` : ""
  }`;

  const detailRow = (label: string, value: string) => (
    <tr key={label}>
      <td className="py-0.5 pr-3 align-top text-neutral-500">{label}</td>
      <td className="py-0.5 font-medium text-neutral-900">{value}</td>
    </tr>
  );

  return (
    <div className="hidden w-full px-[14mm] py-[12mm] text-[12px] leading-relaxed text-neutral-800 [-webkit-box-decoration-break:clone] [box-decoration-break:clone] [print-color-adjust:exact] print:block">
      {/* Zero page margin + padding above: identical spacing whatever margin the print dialog is set to. */}
      {/* Toast pop-ups (e.g. "Payment received") must not land on the printed invoice. */}
      <style>{"@page { size: A4; margin: 0; } @media print { .Toastify { display: none !important; } }"}</style>

      {/* Letterhead */}
      <header className="flex items-start justify-between border-b-2 border-sky-700 pb-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- plain img prints reliably */}
          <img src="/TripWaveLogo.webp" alt="TripWave" className="h-12 w-auto" />
          <p className="mt-3 text-sm font-bold text-neutral-900">{hotel.name}</p>
          <p className="text-neutral-600">{hotel.address}</p>
          <p className="text-neutral-600">
            {phoneDisplay}
            <span className="mx-2 text-neutral-400">|</span>
            info@tripwave.com
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold tracking-[0.2em] text-sky-800">INVOICE</p>
          <table className="ml-auto mt-3 text-right">
            <tbody>
              {[
                ["Invoice no.", invoiceNumber(booking.bookingId)],
                ["Booking ID", booking.bookingId],
                ["Issue date", format(issued, "dd MMM yyyy")],
                ["Balance due", payment.balance > 0 ? `${format(checkIn, "dd MMM yyyy")} (check-in)` : "Nil — paid in full"],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="py-0.5 pr-4 text-neutral-500">{label}</td>
                  <td className="py-0.5 font-semibold text-neutral-900">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <span className="mt-2 inline-block rounded bg-sky-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            {payment.fullyPaid ? "Paid in full" : payment.paid > 0 ? "Deposit paid" : "Payment due"}
          </span>
        </div>
      </header>

      {/* Parties */}
      <section className="mt-5 grid grid-cols-2 gap-8">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-800">Bill to</p>
          <p className="text-sm font-bold text-neutral-900">{guest.name}</p>
          <p>{guest.email}</p>
          <p>{guest.phone}</p>
          {guest.country && <p>{guest.country}</p>}
          {guest.idNumber && (
            <p className="text-neutral-500">
              {guest.idType === "nid" ? "NID" : "Passport"}: •••• {guest.idNumber.toUpperCase().slice(-4)}
            </p>
          )}
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-800">Stay details</p>
          <table>
            <tbody>
              {detailRow("Room", booking.roomName)}
              {detailRow("Check-in", `${format(checkIn, "EEE, dd MMM yyyy")}${times ? `, from ${times.checkIn}` : ""}`)}
              {detailRow("Check-out", `${format(checkOut, "EEE, dd MMM yyyy")}${times ? `, until ${times.checkOut}` : ""}`)}
              {detailRow("Length", `${booking.nights} night${booking.nights !== 1 ? "s" : ""}`)}
              {detailRow("Guests", `${guestsLabel} · ${booking.rooms} room${booking.rooms !== 1 ? "s" : ""}`)}
            </tbody>
          </table>
        </div>
      </section>

      {/* Line items */}
      <table className="mt-5 w-full border-collapse">
        <thead>
          <tr className="bg-sky-800 text-left text-[11px] uppercase tracking-wider text-white">
            <th className="w-8 px-3 py-2 font-semibold">#</th>
            <th className="px-3 py-2 font-semibold">Description</th>
            <th className="px-3 py-2 text-right font-semibold">Qty</th>
            <th className="px-3 py-2 text-right font-semibold">Rate (BDT)</th>
            <th className="px-3 py-2 text-right font-semibold">Amount (BDT)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-neutral-200 align-top">
            <td className="px-3 py-3 text-neutral-500">1</td>
            <td className="px-3 py-3">
              <p className="font-semibold text-neutral-900">{booking.roomName} — room charge</p>
              <p className="text-neutral-500">
                {format(checkIn, "dd MMM")} – {format(checkOut, "dd MMM yyyy")} &middot; {guestsLabel}
              </p>
            </td>
            <td className="px-3 py-3 text-right">
              {booking.nights} night{booking.nights !== 1 ? "s" : ""}
              {booking.rooms > 1 && ` × ${booking.rooms}`}
            </td>
            <td className="px-3 py-3 text-right">{money(booking.pricePerNight)}</td>
            <td className="px-3 py-3 text-right font-medium text-neutral-900">{money(booking.subtotal)}</td>
          </tr>
          <tr className="border-b border-neutral-200">
            <td className="px-3 py-2.5 text-neutral-500">2</td>
            <td className="px-3 py-2.5">Service charge</td>
            <td className="px-3 py-2.5 text-right">3%</td>
            <td className="px-3 py-2.5 text-right">—</td>
            <td className="px-3 py-2.5 text-right font-medium text-neutral-900">{money(booking.serviceFee)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <section className="mt-4 flex justify-between gap-8">
        <div className="max-w-[55%] pt-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-800">Amount in words</p>
          <p className="mt-1 font-semibold italic text-neutral-900">{takaInWords(booking.total)}</p>
        </div>
        <table className="w-72">
          <tbody>
            <tr>
              <td className="py-1 text-neutral-500">Subtotal</td>
              <td className="py-1 text-right">BDT {money(booking.subtotal + booking.serviceFee)}</td>
            </tr>
            <tr>
              <td className="py-1 text-neutral-500">VAT (5% on room charge)</td>
              <td className="py-1 text-right">BDT {money(booking.tax)}</td>
            </tr>
            <tr className="border-t-2 border-neutral-900">
              <td className="pt-2 text-sm font-bold text-neutral-900">Total</td>
              <td className="pt-2 text-right text-sm font-bold text-neutral-900">BDT {money(booking.total)}</td>
            </tr>
            <tr>
              <td className="py-1 text-neutral-500">
                Amount paid{payment.paid > 0 && ` (${payment.method.label}, ${format(issued, "dd MMM")})`}
              </td>
              <td className="py-1 text-right">BDT {money(payment.paid)}</td>
            </tr>
            <tr className="bg-sky-50">
              <td className="px-2 py-2 font-bold text-sky-900">
                {payment.balance > 0 ? "Balance due at check-in" : "Balance due"}
              </td>
              <td className="px-2 py-2 text-right font-bold text-sky-900">BDT {money(payment.balance)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Payment & notes */}
      <section className="mt-5 grid grid-cols-2 gap-8 border-t border-neutral-200 pt-4 [break-inside:avoid]">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-800">Payment</p>
          <p>
            <span className="text-neutral-500">Method:</span>{" "}
            <span className="font-medium">
              {payment.method.label} ({payment.method.detail})
            </span>
          </p>
          <p>
            <span className="text-neutral-500">Plan:</span>{" "}
            <span className="font-medium">
              {booking.paymentPlan === "full"
                ? "Paid in full at booking"
                : payment.paid > 0
                  ? `${DEPOSIT_RATE * 100}% deposit at booking, balance at check-in`
                  : "Pay at hotel"}
            </span>
          </p>
          <p>
            <span className="text-neutral-500">Currency:</span> <span className="font-medium">Bangladeshi Taka (BDT)</span>
          </p>
          <p className="mt-1 text-neutral-500">Please quote {booking.bookingId} with any payment.</p>
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-800">Notes</p>
          <ul className="list-disc space-y-0.5 pl-4">
            {cancellation && (
              <li>
                {cancellation} (until {format(subDays(checkIn, 1), "dd MMM yyyy")}
                {times ? `, ${times.checkIn}` : ""}).
              </li>
            )}
            <li>Valid photo ID (NID or passport) is required at check-in.</li>
            {guest.airportPickup && <li>Airport pickup requested — price to be confirmed by the hotel.</li>}
            {guest.note && <li>Guest requests: {guest.note}.</li>}
          </ul>
        </div>
      </section>

      <footer className="mt-6 border-t border-neutral-200 pt-3 text-center text-[11px] text-neutral-500 [break-inside:avoid]">
        <p className="text-sm font-semibold text-sky-800">Thank you for choosing {hotel.name}!</p>
        <p className="mt-1">
          This is a computer-generated invoice and does not require a signature. Questions? Call {phoneDisplay} or
          email info@tripwave.com.
        </p>
      </footer>
    </div>
  );
}
