import type { OrderLine } from "@/src/lib/gadget-store/types";
import { storeInfo } from "@/src/data/gadgetDetails";
import { formatDateTime, formatTaka, takaInWords } from "@/src/lib/gadget-store/format";
import { invoiceLogo, invoiceLogoSize, invoiceWatermark } from "./invoiceAssets";

/*
 * Print layout that doesn't depend on the browser dialog's margin setting:
 * the page itself has no margin and the invoice carries its own 14mm padding,
 * so "Default", "Minimum" and "None" all print the same. The watermark is
 * position:fixed in print, which centres it on (and repeats it on) every page.
 */
const printCss = `@media print {
  @page { size: A4; margin: 0; }
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  .Toastify, nextjs-portal { display: none !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .invoice-root {
    width: 100% !important; max-width: none !important; margin: 0 !important;
    padding: 14mm !important; border: 0 !important; border-radius: 0 !important;
    box-shadow: none !important; box-sizing: border-box; overflow: visible !important;
  }
  .invoice-watermark { position: fixed !important; }
  tr, .invoice-avoid-break { break-inside: avoid; }
}`;

/** Printable invoice / cash memo. Only this block is visible when printing. */
export default function Invoice({
  title,
  number,
  date,
  billTo,
  items,
  rows,
  total,
  paid,
  footer,
}: {
  title: string;
  number: string;
  date: string;
  billTo: { name: string; phone?: string; address?: string };
  items: OrderLine[];
  rows: [string, number][];
  total: number;
  paid: number;
  footer?: string;
}) {
  const due = Math.max(0, total - paid);
  return (
    <div className="invoice-root relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-neutral-200 bg-white p-10 text-neutral-800">
      <style>{printCss}</style>

      {/* Watermark */}
      <div aria-hidden className="invoice-watermark pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex -rotate-[24deg] flex-col items-center opacity-[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={invoiceWatermark} alt="" className="size-72" />
          <span className="-mt-2 text-6xl font-extrabold tracking-tight text-neutral-900">gadgethub</span>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-6">
          <div className="min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={invoiceLogo}
              alt="gadgethub — Smart Tech Store"
              width={invoiceLogoSize.width}
              height={invoiceLogoSize.height}
              className="h-11 w-auto"
            />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-neutral-500">
              {storeInfo.address}
              <br />
              Phone: {storeInfo.phone}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-extrabold uppercase tracking-wide text-neutral-900">{title}</p>
            <p className="mt-1 text-sm">
              No: <b>{number}</b>
            </p>
            <p className="text-sm text-neutral-500">{formatDateTime(date)}</p>
          </div>
        </div>

        <div className="py-5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Bill to</p>
          <p className="mt-1 font-semibold">{billTo.name || "Walk-in customer"}</p>
          {billTo.phone && <p className="text-neutral-600">{billTo.phone}</p>}
          {billTo.address && <p className="text-neutral-600">{billTo.address}</p>}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="w-8 py-2 pr-2">#</th>
              <th className="py-2 pr-2">Item</th>
              <th className="py-2 pr-2 text-right">Price</th>
              <th className="w-12 py-2 pr-2 text-right">Qty</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((l, i) => (
              <tr key={i} className="border-b border-neutral-100">
                <td className="py-2 pr-2 text-neutral-400">{i + 1}</td>
                <td className="py-2 pr-2">
                  {l.name}
                  {l.variant && <span className="block text-xs text-neutral-500">{l.variant}</span>}
                </td>
                <td className="whitespace-nowrap py-2 pr-2 text-right tabular-nums">{formatTaka(l.price)}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{l.qty}</td>
                <td className="whitespace-nowrap py-2 text-right tabular-nums">{formatTaka(l.price * l.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-avoid-break mt-4 flex items-start justify-between gap-6">
          <span
            className={`mt-3 -rotate-12 rounded-lg border-[3px] px-4 py-1.5 text-center text-xl font-extrabold uppercase tracking-widest opacity-80 ${
              due > 0 ? "border-rose-500 text-rose-500" : "border-emerald-600 text-emerald-600"
            }`}
          >
            {due > 0 ? "Due" : "Paid"}
            {due > 0 && <span className="block text-xs tracking-normal">{formatTaka(due)}</span>}
          </span>
          <dl className="w-64 shrink-0 space-y-1 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-neutral-500">{label}</dt>
                <dd className="tabular-nums">{formatTaka(value)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-neutral-200 pt-1 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatTaka(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Paid</dt>
              <dd className="tabular-nums">{formatTaka(paid)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Due</dt>
              <dd className="tabular-nums">{formatTaka(due)}</dd>
            </div>
          </dl>
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          In words: <span className="font-medium text-neutral-700">{takaInWords(total)}</span>
        </p>

        <div className="invoice-avoid-break mt-14 grid grid-cols-2 gap-10 text-center text-xs text-neutral-500">
          <p className="border-t border-neutral-300 pt-2">Customer signature</p>
          <p className="border-t border-neutral-300 pt-2">Authorised signature</p>
        </div>
        <p className="mt-8 text-center text-[11px] text-neutral-400">
          {footer ?? "Goods once sold are covered by official warranty only. Thank you for shopping with gadgethub."}
        </p>
      </div>
    </div>
  );
}
