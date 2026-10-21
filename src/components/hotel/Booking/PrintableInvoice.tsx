import { format } from "date-fns";
import { chargeLabels, dayOf, payLabels, paymentKindLabels } from "@/src/lib/hotel-store/format";
import { cancellationTerms, creditOf, dueOf, folioTotal, isLive, paidOf, unitNumbers } from "@/src/lib/hotel-store/store";
import type { Booking, HotelDB } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";

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

export const invoiceNumber = (code: string) => `INV-${code.replace(/^TW-/, "")}`;

/** Print/Save-as-PDF uses the document title as the file name, so swap it for the invoice number while printing. */
export function printWithTitle(title: string) {
  const previousTitle = document.title;
  document.title = title;
  window.print();
  document.title = previousTitle;
}

/** Print-only A4 invoice. The screen is hidden when printing; this is what lands on paper/PDF. */
export default function PrintableInvoice({ booking, db }: { booking: Booking; db: HotelDB }) {
  const { guest } = booking;
  const { hotel } = db.content;
  const { settings } = db;
  const checkIn = dayOf(booking.checkIn);
  const checkOut = dayOf(booking.checkOut);
  const issued = new Date(booking.checkedOutAt ?? booking.createdAt);
  const phoneDisplay = hotel.phone.replace(/^\+880(\d{4})(\d+)$/, "+880 $1-$2");
  const paid = paidOf(booking);
  const due = dueOf(booking);
  const credit = creditOf(booking);
  const live = isLive(booking);
  const total = folioTotal(booking);
  const extras = booking.charges.filter((c) => c.amount > 0);
  const discounts = booking.charges.filter((c) => c.amount < 0);
  const discountTotal = (booking.discount?.amount ?? 0) - discounts.reduce((s, c) => s + c.amount, 0);
  const payments = booking.payments.filter((p) => !p.void);
  const rooms = unitNumbers(db, booking.unitIds);
  const terms = cancellationTerms(db, booking);
  const guestsLabel = `${booking.adults} adult${booking.adults !== 1 ? "s" : ""}${
    booking.children ? `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}` : ""
  }`;
  // Paid / unpaid is the watermark; the header badge is only for closed bills.
  const stamp = live ? "" : booking.status === "no-show" ? "No-show" : "Cancelled";

  const detailRow = (label: string, value: string) => (
    <tr key={label}>
      <td className="py-0.5 pr-3 align-top text-neutral-500">{label}</td>
      <td className="py-0.5 font-medium text-neutral-900">{value}</td>
    </tr>
  );

  return (
    <div className="hidden w-full px-[14mm] py-[12mm] text-[12px] leading-relaxed text-neutral-800 [-webkit-box-decoration-break:clone] [box-decoration-break:clone] [print-color-adjust:exact] print:block">
      {/* Zero page margin + padding above: identical spacing whatever margin the print dialog is set to. */}
      {/* Toast pop-ups must not land on the printed invoice. */}
      <style>{"@page { size: A4; margin: 0; } @media print { .Toastify { display: none !important; } }"}</style>

      {/* Diagonal PAID / UNPAID watermark; `fixed` repeats it on every printed page. Not shown on cancelled or no-show bills. */}
      {live && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
          <span
            className={cn(
              "-rotate-30 select-none rounded-xl border-[6px] px-10 py-2 text-[120px] font-black uppercase leading-none tracking-[0.15em] opacity-[0.08]",
              due === 0 ? "border-emerald-700 text-emerald-700" : "border-rose-700 text-rose-700"
            )}
          >
            {due === 0 ? "Paid" : "Unpaid"}
          </span>
        </div>
      )}

      <header className="flex items-start justify-between border-b-2 border-sky-700 pb-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- plain img prints reliably */}
          <img src="/TripWaveLogo.webp" alt="TripWave" className="h-12 w-auto" />
          <p className="mt-3 text-sm font-bold text-neutral-900">{hotel.name}</p>
          <p className="text-neutral-600">{hotel.address}</p>
          <p className="text-neutral-600">
            {phoneDisplay}
            <span className="mx-2 text-neutral-400">|</span>
            {hotel.email}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold tracking-[0.2em] text-sky-800">INVOICE</p>
          <table className="ml-auto mt-3 text-right">
            <tbody>
              {[
                ["Invoice no.", invoiceNumber(booking.code)],
                ["Booking ID", booking.code],
                ["Issue date", format(issued, "dd MMM yyyy")],
                ["Balance due", due > 0 ? `BDT ${money(due)}` : "Nil"],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="py-0.5 pr-4 text-neutral-500">{label}</td>
                  <td className="py-0.5 font-semibold text-neutral-900">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stamp && <span className="mt-2 inline-block rounded bg-sky-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">{stamp}</span>}
        </div>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-8">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-800">Bill to</p>
          <p className="text-sm font-bold text-neutral-900">{guest.name}</p>
          {guest.email && <p>{guest.email}</p>}
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
              {detailRow("Room", `${booking.roomName}${rooms.length ? ` · No. ${rooms.join(", ")}` : ""}`)}
              {detailRow("Check-in", `${format(checkIn, "EEE, dd MMM yyyy")}, from ${settings.checkInTime}`)}
              {detailRow("Check-out", `${format(checkOut, "EEE, dd MMM yyyy")}, until ${settings.checkOutTime}`)}
              {detailRow("Length", `${booking.nights} night${booking.nights !== 1 ? "s" : ""}`)}
              {detailRow("Guests", `${guestsLabel} · ${booking.rooms} room${booking.rooms !== 1 ? "s" : ""}`)}
            </tbody>
          </table>
        </div>
      </section>

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
            <td className="px-3 py-2.5 text-right">{booking.serviceFeeRate ?? settings.serviceFeeRate}%</td>
            <td className="px-3 py-2.5 text-right">—</td>
            <td className="px-3 py-2.5 text-right font-medium text-neutral-900">{money(booking.serviceFee)}</td>
          </tr>
          {extras.map((c, i) => (
            <tr key={c.id} className="border-b border-neutral-200">
              <td className="px-3 py-2.5 text-neutral-500">{i + 3}</td>
              <td className="px-3 py-2.5">
                {c.description}
                <span className="text-neutral-500"> · {chargeLabels[c.category]}, {format(new Date(c.at), "dd MMM")}</span>
              </td>
              <td className="px-3 py-2.5 text-right">1</td>
              <td className="px-3 py-2.5 text-right">{money(c.amount)}</td>
              <td className="px-3 py-2.5 text-right font-medium text-neutral-900">{money(c.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-4 flex justify-between gap-8">
        <div className="max-w-[55%] pt-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-800">Amount in words</p>
          <p className="mt-1 font-semibold italic text-neutral-900">{takaInWords(total)}</p>
        </div>
        <table className="w-72">
          <tbody>
            <tr>
              <td className="py-1 text-neutral-500">Subtotal</td>
              <td className="py-1 text-right">BDT {money(booking.subtotal + booking.serviceFee + extras.reduce((s, c) => s + c.amount, 0))}</td>
            </tr>
            {discountTotal > 0 && (
              <tr>
                <td className="py-1 text-neutral-500">
                  Discount{booking.discount?.kind === "percent" && !discounts.length ? ` (${booking.discount.value}% on room)` : ""}
                </td>
                <td className="py-1 text-right">− BDT {money(discountTotal)}</td>
              </tr>
            )}
            <tr>
              <td className="py-1 text-neutral-500">VAT ({booking.vatRate ?? settings.vatRate}% on room charge)</td>
              <td className="py-1 text-right">BDT {money(booking.tax)}</td>
            </tr>
            <tr className="border-t-2 border-neutral-900">
              <td className="pt-2 text-sm font-bold text-neutral-900">Total</td>
              <td className="pt-2 text-right text-sm font-bold text-neutral-900">BDT {money(total)}</td>
            </tr>
            <tr>
              <td className="py-1 text-neutral-500">Paid (net of refunds)</td>
              <td className="py-1 text-right">BDT {money(paid)}</td>
            </tr>
            {!live && (booking.cancellationFee ?? 0) > 0 && (
              <tr>
                <td className="py-1 text-neutral-500">Cancellation fee kept</td>
                <td className="py-1 text-right">BDT {money(booking.cancellationFee ?? 0)}</td>
              </tr>
            )}
            <tr className="bg-sky-50">
              <td className="px-2 py-2 font-bold text-sky-900">{credit > 0 ? "Refund due to guest" : "Balance due"}</td>
              <td className="px-2 py-2 text-right font-bold text-sky-900">BDT {money(credit > 0 ? credit : due)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {payments.length > 0 && (
        <section className="mt-5 [break-inside:avoid]">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-800">Payments</p>
          <table className="w-full border-collapse">
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100">
                  <td className="py-1.5 pr-3 text-neutral-500">{format(new Date(p.at), "dd MMM yyyy, h:mm a")}</td>
                  <td className="py-1.5 pr-3">{paymentKindLabels[p.kind]}</td>
                  <td className="py-1.5 pr-3">{payLabels[p.method]}</td>
                  <td className="py-1.5 pr-3 font-mono text-[11px] text-neutral-500">{p.ref ?? ""}</td>
                  <td className="py-1.5 text-right font-medium">
                    {p.kind === "refund" ? "−" : ""}BDT {money(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mt-5 border-t border-neutral-200 pt-4 [break-inside:avoid]">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-800">Notes</p>
        <ul className="list-disc space-y-0.5 pl-4">
          {live && settings.freeCancellationHours > 0 && booking.status !== "checked-out" && booking.status !== "checked-in" && (
            <li>
              Free cancellation until {format(new Date(terms.freeUntil), "dd MMM yyyy, h:mm a")}; later cancellations keep{" "}
              {settings.lateCancellationFeeRate}% of the total.
            </li>
          )}
          {booking.cancelReason && !live && <li>{booking.cancelReason}.</li>}
          <li>Valid photo ID (NID or passport) is required at check-in.</li>
          {guest.airportPickup && <li>Airport pickup requested — price to be confirmed by the hotel.</li>}
          {guest.note && <li>Guest requests: {guest.note}.</li>}
          <li>Please quote {booking.code} with any payment. Charged in Bangladeshi Taka (BDT).</li>
        </ul>
      </section>

      <footer className="mt-6 border-t border-neutral-200 pt-3 text-center text-[11px] text-neutral-500 [break-inside:avoid]">
        <p className="text-sm font-semibold text-sky-800">Thank you for choosing {hotel.name}!</p>
        <p className="mt-1">
          This is a computer-generated invoice and does not require a signature. Questions? Call {phoneDisplay} or email{" "}
          {hotel.email}.
        </p>
        {booking.status === "checked-in" && <p className="mt-1">Interim bill — {format(new Date(), "dd MMM yyyy, h:mm a")}.</p>}
      </footer>
    </div>
  );
}
