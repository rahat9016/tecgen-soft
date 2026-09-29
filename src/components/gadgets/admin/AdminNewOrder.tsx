"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarClock, Minus, Plus, Search, ShoppingCart, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "react-toastify";
import { createAdminOrder, deliveryFeeFor, useGadgetDB } from "@/src/lib/gadget-store/store";
import type { Order, PaymentMethod, Product } from "@/src/lib/gadget-store/types";
import { formatDate, formatTaka, paymentLabels } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import { Field, inputClass } from "../shared";
import { btn, Card } from "./kit";

type Line = { key: string; product: Product; qty: number; color?: string; storage?: string };

const cities = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Cumilla"];

export default function AdminNewOrder() {
  const db = useGadgetDB();
  const router = useRouter();
  const params = useSearchParams();

  const [type, setType] = useState<Order["type"]>(params.get("type") === "preorder" ? "preorder" : "regular");
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = useState<string | null>(params.get("c"));
  const [custQ, setCustQ] = useState("");
  const [newCust, setNewCust] = useState({ name: "", phone: "", email: "", address: "", city: "Dhaka" });

  const [q, setQ] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [paid, setPaid] = useState("");
  const [discount, setDiscount] = useState("");
  const [delivery, setDelivery] = useState("");
  const [note, setNote] = useState("");

  const customer = db.customers.find((c) => c.id === customerId);
  const customerMatches = useMemo(() => {
    const t = custQ.trim().toLowerCase();
    if (!t) return db.customers.slice(0, 5);
    const digits = t.replace(/\D/g, "");
    return db.customers
      .filter((c) => c.name.toLowerCase().includes(t) || (digits && c.phone.replace(/\D/g, "").includes(digits)))
      .slice(0, 6);
  }, [db.customers, custQ]);

  const productMatches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return db.products
      .filter((p) => (type === "preorder" ? p.preOrder : !p.preOrder) && `${p.name} ${p.brand}`.toLowerCase().includes(t))
      .slice(0, 6);
  }, [db.products, q, type]);

  const switchType = (t: Order["type"]) => {
    if (t === type) return;
    setType(t);
    setLines([]);
    setPaid("");
    setDelivery("");
  };

  const addProduct = (p: Product) => {
    if (type === "regular" && p.stock === 0) return toast.error("Out of stock");
    setLines((ls) => [
      ...ls,
      { key: `${p.id}-${Date.now()}`, product: p, qty: 1, color: p.colors?.[0], storage: p.storage?.[0] },
    ]);
    setQ("");
  };
  const patch = (key: string, v: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...v } : l)));

  const city = mode === "new" ? newCust.city : (customer?.city ?? "Dhaka");
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const qtyTotal = lines.reduce((s, l) => s + l.qty, 0);
  const deliveryFee = type === "preorder" ? 0 : delivery === "" ? (lines.length ? deliveryFeeFor(subtotal, city) : 0) : Math.max(0, Number(delivery) || 0);
  const disc = Math.min(subtotal, Math.max(0, Math.round(Number(discount) || 0)));
  const total = subtotal + deliveryFee - disc;
  const depositDue = type === "preorder" ? lines.reduce((s, l) => s + (l.product.preOrder?.deposit ?? 0) * l.qty, 0) : 0;
  const defaultPaid = type === "preorder" ? depositDue : method === "cod" ? 0 : total;
  const paidAmt = paid === "" ? defaultPaid : Math.min(total, Math.max(0, Math.round(Number(paid) || 0)));

  const methods: PaymentMethod[] = type === "preorder" ? ["cash", "bkash", "nagad", "card", "bank"] : ["cash", "cod", "bkash", "nagad", "card", "emi", "bank"];

  const submit = () => {
    if (mode === "existing" && !customer) return toast.error("Select a customer");
    if (mode === "new" && (!newCust.name.trim() || !newCust.phone.trim())) return toast.error("Customer name and phone are required");
    if (!lines.length) return toast.error("Add at least one product");
    if (type === "regular") {
      for (const l of lines) {
        const inOrder = lines.filter((x) => x.product.id === l.product.id).reduce((s, x) => s + x.qty, 0);
        if (inOrder > l.product.stock) return toast.error(`Only ${l.product.stock} × ${l.product.name} in stock`);
      }
    }
    const id = createAdminOrder({
      customer: mode === "existing" ? { id: customer!.id } : { ...newCust, name: newCust.name.trim(), phone: newCust.phone.trim() },
      lines: lines.map((l) => ({
        product: l.product,
        qty: l.qty,
        variant: [l.color, l.storage].filter(Boolean).join(" · ") || undefined,
      })),
      type,
      paymentMethod: method,
      paid: paidAmt,
      deliveryFee,
      discount: disc,
      note: note.trim() || undefined,
    });
    toast.success(`${type === "preorder" ? "Pre-order" : "Order"} ${id} created`);
    router.push(`/gadgets/admin/orders/${id}`);
  };

  const pre = type === "preorder";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href={pre ? "/gadgets/admin/pre-orders" : "/gadgets/admin/orders"} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-orange-600">
            <ArrowLeft className="size-4" /> {pre ? "Pre-orders" : "Orders"}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">{pre ? "New pre-order" : "New order"}</h1>
          <p className="mt-1 text-sm text-neutral-500">Place an order on behalf of a customer — phone, walk-in or social media.</p>
        </div>
        <div className="flex rounded-xl bg-white p-1 ring-1 ring-neutral-200">
          {(
            [
              ["regular", "Regular order", ShoppingCart],
              ["preorder", "Pre-order", CalendarClock],
            ] as const
          ).map(([t, label, Icon]) => (
            <button
              key={t}
              onClick={() => switchType(t)}
              aria-pressed={type === t}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                type === t ? (t === "preorder" ? "bg-violet-600 text-white" : "bg-neutral-900 text-white") : "text-neutral-600"
              )}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 [&>*]:min-w-0 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-neutral-900">Customer</h2>
              <div className="flex gap-1 text-xs">
                <button onClick={() => setMode("existing")} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5", mode === "existing" ? "bg-orange-50 font-semibold text-orange-700" : "text-neutral-500")}>
                  <Users className="size-3.5" /> Existing
                </button>
                <button onClick={() => setMode("new")} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5", mode === "new" ? "bg-orange-50 font-semibold text-orange-700" : "text-neutral-500")}>
                  <UserPlus className="size-3.5" /> New customer
                </button>
              </div>
            </div>

            {mode === "existing" ? (
              customer ? (
                <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4">
                  <div className="text-sm">
                    <p className="font-semibold text-neutral-900">{customer.name}</p>
                    <p className="text-neutral-600">
                      {customer.phone} · {customer.email}
                    </p>
                    <p className="text-neutral-500">
                      {customer.address}, {customer.city}
                    </p>
                  </div>
                  <button onClick={() => setCustomerId(null)} className="text-sm text-orange-600 hover:underline">
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={custQ}
                    onChange={(e) => setCustQ(e.target.value)}
                    placeholder="Search by name or phone"
                    aria-label="Search customers"
                    className={inputClass}
                  />
                  <ul className="mt-2 divide-y divide-neutral-100 rounded-xl border border-neutral-100">
                    {customerMatches.map((c) => (
                      <li key={c.id}>
                        <button onClick={() => setCustomerId(c.id)} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-orange-50">
                          <span className="font-medium text-neutral-900">{c.name}</span>
                          <span className="text-neutral-500">
                            {c.phone} · {c.city}
                          </span>
                        </button>
                      </li>
                    ))}
                    {customerMatches.length === 0 && (
                      <li className="px-4 py-3 text-sm text-neutral-500">
                        No match.{" "}
                        <button onClick={() => setMode("new")} className="text-orange-600 hover:underline">
                          Add as new customer
                        </button>
                      </li>
                    )}
                  </ul>
                </>
              )
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input value={newCust.name} onChange={(e) => setNewCust({ ...newCust, name: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Phone">
                  <input value={newCust.phone} onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })} className={inputClass} placeholder="01XXXXXXXXX" />
                </Field>
                <Field label="Email (optional)">
                  <input type="email" value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} className={inputClass} />
                </Field>
                <Field label="City">
                  <select value={newCust.city} onChange={(e) => setNewCust({ ...newCust, city: e.target.value })} className={inputClass}>
                    {cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Address" className="sm:col-span-2">
                  <input value={newCust.address} onChange={(e) => setNewCust({ ...newCust, address: e.target.value })} className={inputClass} />
                </Field>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold text-neutral-900">{pre ? "Pre-order products" : "Products"}</h2>
            <div className="relative">
              <div className="flex h-11 items-center rounded-xl border border-neutral-200 px-3.5 focus-within:border-orange-400">
                <Search className="size-4 text-neutral-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && productMatches[0]) {
                      e.preventDefault();
                      addProduct(productMatches[0]);
                    }
                  }}
                  placeholder={pre ? "Search upcoming products…" : "Search in-stock products…"}
                  aria-label="Search product"
                  className="h-full flex-1 bg-transparent px-3 text-sm outline-none"
                />
              </div>
              {productMatches.length > 0 && (
                <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-xl">
                  {productMatches.map((p) => (
                    <li key={p.id}>
                      <button onClick={() => addProduct(p)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt="" className="size-10 rounded-lg object-cover" />
                        <span className="flex-1 text-sm">
                          <span className="line-clamp-1 font-medium text-neutral-900">{p.name}</span>
                          <span className="text-xs text-neutral-500">
                            {p.preOrder ? `Launch ${formatDate(p.preOrder.releaseDate)} · deposit ${formatTaka(p.preOrder.deposit)}` : `Stock ${p.stock}`}
                          </span>
                        </span>
                        <span className="text-sm font-semibold">{formatTaka(p.price)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ul className="mt-4 divide-y divide-neutral-100">
              {lines.map((l) => (
                <li key={l.key} className="flex flex-wrap items-center gap-3 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.product.image} alt="" className="size-12 rounded-lg object-cover" />
                  <div className="min-w-40 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-neutral-900">{l.product.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {l.product.colors && (
                        <select value={l.color} onChange={(e) => patch(l.key, { color: e.target.value })} aria-label="Color" className="h-8 rounded-lg border border-neutral-200 px-2 text-xs">
                          {l.product.colors.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      )}
                      {l.product.storage && (
                        <select value={l.storage} onChange={(e) => patch(l.key, { storage: e.target.value })} aria-label="Storage" className="h-8 rounded-lg border border-neutral-200 px-2 text-xs">
                          {l.product.storage.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center rounded-lg border border-neutral-200">
                    <button onClick={() => patch(l.key, { qty: Math.max(1, l.qty - 1) })} className="p-1.5" aria-label="Decrease">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                    <button onClick={() => patch(l.key, { qty: l.qty + 1 })} className="p-1.5" aria-label="Increase">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="w-24 text-right text-sm font-semibold tabular-nums">{formatTaka(l.product.price * l.qty)}</span>
                  <button onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className={btn.ghostDanger} aria-label={`Remove ${l.product.name}`}>
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
              {lines.length === 0 && <li className="py-8 text-center text-sm text-neutral-400">Search above to add products.</li>}
            </ul>
          </Card>
        </div>

        <Card className={cn("h-fit xl:sticky xl:top-24", pre && "border-violet-200")}>
          <h2 className="font-semibold text-neutral-900">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label={`Items (${qtyTotal})`} value={formatTaka(subtotal)} />
            {!pre && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-neutral-500">Delivery fee</dt>
                <dd>
                  <input type="number" min={0} value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder={String(deliveryFee)} aria-label="Delivery fee" className="h-9 w-28 rounded-lg border border-neutral-200 px-2 text-right text-sm tabular-nums outline-none focus:border-orange-400" />
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-500">Discount</dt>
              <dd>
                <input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" aria-label="Discount" className="h-9 w-28 rounded-lg border border-neutral-200 px-2 text-right text-sm tabular-nums outline-none focus:border-orange-400" />
              </dd>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2 text-lg font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatTaka(total)}</dd>
            </div>
            {pre && <Row label="Required deposit" value={formatTaka(depositDue)} accent />}
          </dl>

          <p className="mb-2 mt-5 text-xs font-medium text-neutral-600">{pre ? "Deposit paid via" : "Payment method"}</p>
          <div className="grid grid-cols-3 gap-2">
            {methods.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMethod(m);
                  setPaid("");
                }}
                className={cn("rounded-lg border px-2 py-2 text-xs font-medium", method === m ? "border-orange-400 bg-orange-50 text-orange-700" : "border-neutral-200 text-neutral-600")}
              >
                {paymentLabels[m]}
              </button>
            ))}
          </div>

          <Field label={pre ? "Deposit received" : "Amount received now"} className="mt-4">
            <input type="number" min={0} value={paid} onChange={(e) => setPaid(e.target.value)} placeholder={String(defaultPaid)} className={inputClass} />
          </Field>
          <dl className="mt-3 space-y-1 text-sm">
            <Row label="Received" value={formatTaka(paidAmt)} />
            <Row label={pre ? "Balance on delivery" : "Due"} value={formatTaka(Math.max(0, total - paidAmt))} accent={total - paidAmt > 0} />
          </dl>

          <Field label="Internal note (optional)" className="mt-4">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Ordered by phone call" className={inputClass} />
          </Field>

          <button onClick={submit} className={cn(btn.primary, "mt-5 h-12 w-full", pre && "bg-violet-600 hover:bg-violet-700")}>
            {pre ? "Create pre-order" : "Create order"}
          </button>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("flex justify-between", accent && "font-semibold text-orange-600")}>
      <dt className={accent ? "" : "text-neutral-500"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
