import type { OrderLine } from "@/src/lib/gadget-store/types";
import { storeInfo } from "@/src/data/gadgetDetails";
import { formatDateTime, formatTaka, takaInWords } from "@/src/lib/gadget-store/format";

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
    <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-8 text-neutral-800 print:max-w-none print:rounded-none print:border-0 print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-200 pb-6">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gadgets/logo-horizontal.webp" alt="gadgethub" className="h-10 w-auto" />
          <p className="mt-3 max-w-xs text-xs text-neutral-500">
            {storeInfo.address}
            <br />
            Phone: {storeInfo.phone}
          </p>
        </div>
        <div className="text-right">
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
            <th className="py-2 pr-2">#</th>
            <th className="py-2 pr-2">Item</th>
            <th className="py-2 pr-2 text-right">Price</th>
            <th className="py-2 pr-2 text-right">Qty</th>
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
              <td className="py-2 pr-2 text-right tabular-nums">{formatTaka(l.price)}</td>
              <td className="py-2 pr-2 text-right tabular-nums">{l.qty}</td>
              <td className="py-2 text-right tabular-nums">{formatTaka(l.price * l.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <dl className="w-64 space-y-1 text-sm">
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

      <div className="mt-12 grid grid-cols-2 gap-10 text-center text-xs text-neutral-500">
        <p className="border-t border-neutral-300 pt-2">Customer signature</p>
        <p className="border-t border-neutral-300 pt-2">Authorised signature</p>
      </div>
      <p className="mt-8 text-center text-[11px] text-neutral-400">
        {footer ?? "Goods once sold are covered by official warranty only. Thank you for shopping with gadgethub."}
      </p>
    </div>
  );
}
