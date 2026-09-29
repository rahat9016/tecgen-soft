"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { createMemo, useGadgetDB } from "@/src/lib/gadget-store/store";
import type { OrderLine, PaymentMethod } from "@/src/lib/gadget-store/types";
import { formatTaka, paymentLabels } from "@/src/lib/gadget-store/format";
import { btn, Card } from "@/src/components/gadgets/admin/kit";
import { Field, inputClass } from "@/src/components/gadgets/shared";

export default function NewCashMemoPage() {
  const db = useGadgetDB();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [soldBy, setSoldBy] = useState("Store Admin");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState("");
  const [paid, setPaid] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return db.products.filter((p) => !p.preOrder && `${p.name} ${p.brand}`.toLowerCase().includes(term)).slice(0, 6);
  }, [db.products, q]);

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const disc = Math.min(subtotal, Math.max(0, Math.round(Number(discount) || 0)));
  const total = subtotal - disc;
  const paidAmt = paid === "" ? total : Math.min(total, Math.max(0, Math.round(Number(paid) || 0)));
  const change = paid !== "" && Number(paid) > total ? Math.round(Number(paid)) - total : 0;

  const add = (id: string) => {
    const p = db.products.find((x) => x.id === id)!;
    const inCart = lines.find((l) => l.productId === id)?.qty ?? 0;
    if (inCart >= p.stock) return toast.error(`Only ${p.stock} in stock`);
    setLines((ls) =>
      ls.some((l) => l.productId === id)
        ? ls.map((l) => (l.productId === id ? { ...l, qty: l.qty + 1 } : l))
        : [...ls, { productId: p.id, name: p.name, image: p.image, price: p.price, cost: p.cost, qty: 1 }]
    );
    setQ("");
  };

  const setQty = (id: string, qty: number) => {
    const stock = db.products.find((p) => p.id === id)?.stock ?? 0;
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.productId !== id) : ls.map((l) => (l.productId === id ? { ...l, qty: Math.min(qty, stock) } : l))));
  };

  const submit = () => {
    if (!lines.length) return toast.error("Add at least one product");
    const id = createMemo({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: lines,
      subtotal,
      discount: disc,
      total,
      paid: paidAmt,
      paymentMethod: method,
      soldBy: soldBy.trim() || "Store Admin",
    });
    toast.success(`Cash memo ${id} saved`);
    router.push(`/gadgets/admin/cash-memo/${id}?print=1`);
  };

  return (
    <>
      <div className="mb-6">
        <Link href="/gadgets/admin/cash-memo" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-orange-600">
          <ArrowLeft className="size-4" /> Cash memos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">New cash memo</h1>
      </div>

      <div className="grid gap-6 [&>*]:min-w-0 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <div className="relative">
              <div className="flex h-12 items-center rounded-xl border border-neutral-200 px-4 focus-within:border-orange-400">
                <Search className="size-5 text-neutral-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && results[0]) {
                      e.preventDefault();
                      add(results[0].id);
                    }
                  }}
                  placeholder="Search product to add (Enter adds first match)"
                  aria-label="Search product"
                  className="h-full flex-1 bg-transparent px-3 text-sm outline-none"
                />
              </div>
              {results.length > 0 && (
                <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-xl">
                  {results.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => add(p.id)}
                        disabled={p.stock === 0}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-50 disabled:opacity-40"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt="" className="size-10 rounded-lg object-cover" />
                        <span className="flex-1 text-sm">
                          <span className="line-clamp-1 font-medium text-neutral-900">{p.name}</span>
                          <span className="text-xs text-neutral-500">Stock {p.stock}</span>
                        </span>
                        <span className="text-sm font-semibold">{formatTaka(p.price)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <table className="mt-5 w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {lines.map((l) => (
                  <tr key={l.productId}>
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={l.image} alt="" className="size-10 rounded-lg object-cover" />
                        <span className="line-clamp-2 font-medium text-neutral-900">{l.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right tabular-nums">{formatTaka(l.price)}</td>
                    <td className="py-3">
                      <div className="mx-auto flex w-fit items-center rounded-lg border border-neutral-200">
                        <button onClick={() => setQty(l.productId, l.qty - 1)} className="p-1.5" aria-label="Decrease">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center tabular-nums">{l.qty}</span>
                        <button onClick={() => setQty(l.productId, l.qty + 1)} className="p-1.5" aria-label="Increase">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums">{formatTaka(l.price * l.qty)}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => setQty(l.productId, 0)} className={btn.ghostDanger} aria-label={`Remove ${l.name}`}>
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {lines.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-neutral-400">
                      Search above to add products to this memo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="grid gap-4">
              <Field label="Sold by">
                <input value={soldBy} onChange={(e) => setSoldBy(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Customer name">
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in customer" className={inputClass} />
              </Field>
              <Field label="Customer phone">
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="01XXXXXXXXX" className={inputClass} />
              </Field>
            </div>
          </Card>

          <Card>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd className="tabular-nums">{formatTaka(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-neutral-500">Discount</dt>
                <dd>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    aria-label="Discount"
                    placeholder="0"
                    className="h-9 w-32 rounded-lg border border-neutral-200 px-2 text-right text-sm tabular-nums outline-none focus:border-orange-400"
                  />
                </dd>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-2 text-lg font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatTaka(total)}</dd>
              </div>
            </dl>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {(["cash", "card", "bkash", "nagad", "emi", "bank"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium ${method === m ? "border-orange-400 bg-orange-50 text-orange-700" : "border-neutral-200 text-neutral-600"}`}
                >
                  {paymentLabels[m]}
                </button>
              ))}
            </div>

            <Field label="Amount received" className="mt-4">
              <input
                type="number"
                min={0}
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                placeholder={`${total} (full)`}
                className={inputClass}
              />
            </Field>
            <dl className="mt-3 space-y-1 text-sm">
              {total - paidAmt > 0 && (
                <div className="flex justify-between font-semibold text-rose-600">
                  <dt>Due</dt>
                  <dd className="tabular-nums">{formatTaka(total - paidAmt)}</dd>
                </div>
              )}
              {change > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600">
                  <dt>Change to return</dt>
                  <dd className="tabular-nums">{formatTaka(change)}</dd>
                </div>
              )}
            </dl>

            <button onClick={submit} disabled={!lines.length} className={`${btn.primary} mt-5 h-12 w-full`}>
              Save & print memo
            </button>
          </Card>
        </div>
      </div>
    </>
  );
}
