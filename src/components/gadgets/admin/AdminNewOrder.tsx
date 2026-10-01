"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  CalendarRange,
  Check,
  CircleDashed,
  CreditCard,
  Landmark,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Smartphone,
  Trash2,
  Truck,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { createAdminOrder, deliveryFeeFor, useGadgetDB } from "@/src/lib/gadget-store/store";
import type { Customer, Order, PaymentMethod, Product } from "@/src/lib/gadget-store/types";
import { formatDate, formatTaka, paymentLabels } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import { checkoutCities as cities } from "../checkoutSchema";
import { btn, Card } from "./kit";

type Line = { key: string; product: Product; qty: number; color?: string; storage?: string };

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";

const methodIcons: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  cash: Banknote,
  cod: Truck,
  bkash: Smartphone,
  nagad: Wallet,
  card: CreditCard,
  emi: CalendarRange,
  bank: Landmark,
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

  const pre = type === "preorder";
  const customer = db.customers.find((c) => c.id === customerId);
  const orderCount = (c: Customer) => db.orders.filter((o) => o.customerId === c.id).length;

  const customerMatches = useMemo(() => {
    const t = custQ.trim().toLowerCase();
    if (!t) return db.customers.slice(0, 5);
    const digits = t.replace(/\D/g, "");
    return db.customers
      .filter((c) => c.name.toLowerCase().includes(t) || (digits && c.phone.replace(/\D/g, "").includes(digits)))
      .slice(0, 6);
  }, [db.customers, custQ]);

  const eligible = useMemo(
    () => db.products.filter((p) => p.active && (pre ? p.preOrder : !p.preOrder && p.stock > 0)),
    [db.products, pre]
  );
  const productMatches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return eligible.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(t)).slice(0, 6);
  }, [eligible, q]);
  const quickAdd = useMemo(
    () => [...eligible].sort((a, b) => (pre ? 0 : b.stock - a.stock)).slice(0, 6),
    [eligible, pre]
  );

  const switchType = (t: Order["type"]) => {
    if (t === type) return;
    setType(t);
    setLines([]);
    setPaid("");
    setDelivery("");
    setMethod("cash");
  };

  const addProduct = (p: Product) => {
    if (type === "regular" && p.stock === 0) return toast.error("Out of stock");
    setLines((ls) => [...ls, { key: `${p.id}-${Date.now()}`, product: p, qty: 1, color: p.colors?.[0], storage: p.storage?.[0] }]);
    setQ("");
  };
  const patch = (key: string, v: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...v } : l)));

  const city = mode === "new" ? newCust.city : (customer?.city ?? "Dhaka");
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const qtyTotal = lines.reduce((s, l) => s + l.qty, 0);
  const deliveryFee = pre ? 0 : delivery === "" ? (lines.length ? deliveryFeeFor(subtotal, city) : 0) : Math.max(0, Number(delivery) || 0);
  const disc = Math.min(subtotal, Math.max(0, Math.round(Number(discount) || 0)));
  const total = subtotal + deliveryFee - disc;
  const depositDue = pre ? lines.reduce((s, l) => s + (l.product.preOrder?.deposit ?? 0) * l.qty, 0) : 0;
  const defaultPaid = pre ? depositDue : method === "cod" ? 0 : total;
  const paidAmt = paid === "" ? defaultPaid : Math.min(total, Math.max(0, Math.round(Number(paid) || 0)));
  const due = Math.max(0, total - paidAmt);

  const methods: PaymentMethod[] = pre ? ["cash", "bkash", "nagad", "card", "bank"] : ["cash", "cod", "bkash", "nagad", "card", "emi", "bank"];

  const customerReady = mode === "existing" ? !!customer : !!(newCust.name.trim() && newCust.phone.trim());
  const ready = customerReady && lines.length > 0;

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
    toast.success(`${pre ? "Pre-order" : "Order"} ${id} created`);
    router.push(`/gadgets/admin/orders/${id}`);
  };

  const accent = pre ? "violet" : "orange";

  return (
    <div className="pb-24 xl:pb-0">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href={pre ? "/gadgets/admin/pre-orders" : "/gadgets/admin/orders"}
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-orange-600"
          >
            <ArrowLeft className="size-4" /> {pre ? "Pre-orders" : "Orders"}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">{pre ? "New pre-order" : "New order"}</h1>
          <p className="mt-1 text-sm text-neutral-500">Place an order on behalf of a customer — phone, walk-in or social media.</p>
        </div>
        <div className="grid w-full grid-cols-2 rounded-xl bg-white p-1 ring-1 ring-neutral-200 sm:inline-flex sm:w-auto">
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
                "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                type === t
                  ? t === "preorder"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-6 [&>*]:min-w-0 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* ── 1. Customer ── */}
          <Card className="p-0">
            <StepHeader step={1} title="Customer" done={customerReady} accent={accent}>
              <div className="flex rounded-lg bg-neutral-100 p-0.5 text-xs">
                {(
                  [
                    ["existing", "Existing", Users],
                    ["new", "New", UserPlus],
                  ] as const
                ).map(([m, label, Icon]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition",
                      mode === m ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                    )}
                  >
                    <Icon className="size-3.5" /> {label}
                  </button>
                ))}
              </div>
            </StepHeader>

            <div className="p-5 sm:p-6">
              {mode === "existing" ? (
                customer ? (
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                      {initials(customer.name)}
                    </span>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-semibold text-neutral-900">{customer.name}</p>
                      <p className="text-neutral-600">
                        {customer.phone}
                        {customer.email && ` · ${customer.email}`}
                      </p>
                      <p className="text-neutral-500">
                        {customer.address ? `${customer.address}, ` : ""}
                        {customer.city} · {orderCount(customer)} previous orders
                      </p>
                    </div>
                    <button onClick={() => setCustomerId(null)} className={btn.outline}>
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        value={custQ}
                        onChange={(e) => setCustQ(e.target.value)}
                        placeholder="Search by name or phone"
                        aria-label="Search customers"
                        className={cn(inputClass, "pl-10")}
                      />
                    </div>
                    <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      {custQ.trim() ? "Matches" : "Recent customers"}
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {customerMatches.map((c) => (
                        <li key={c.id}>
                          <button
                            onClick={() => setCustomerId(c.id)}
                            className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left transition hover:border-orange-300 hover:bg-orange-50/40"
                          >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">
                              {initials(c.name)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-neutral-900">{c.name}</span>
                              <span className="block truncate text-xs text-neutral-500">
                                {c.phone} · {c.city}
                              </span>
                            </span>
                            <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                              {orderCount(c)} orders
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {customerMatches.length === 0 && (
                      <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
                        No customer found.{" "}
                        <button onClick={() => setMode("new")} className="font-medium text-orange-600 hover:underline">
                          Add as new customer
                        </button>
                      </div>
                    )}
                  </>
                )
              ) : (
                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <label>
                    <span className={labelClass}>
                      Full name <span className="text-rose-500">*</span>
                    </span>
                    <input value={newCust.name} onChange={(e) => setNewCust({ ...newCust, name: e.target.value })} placeholder="Customer name" className={inputClass} />
                  </label>
                  <label>
                    <span className={labelClass}>
                      Phone <span className="text-rose-500">*</span>
                    </span>
                    <input type="tel" value={newCust.phone} onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })} placeholder="01XXXXXXXXX" className={inputClass} />
                  </label>
                  <label>
                    <span className={labelClass}>Email</span>
                    <input type="email" value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} placeholder="Optional" className={inputClass} />
                  </label>
                  <label>
                    <span className={labelClass}>City</span>
                    <select value={newCust.city} onChange={(e) => setNewCust({ ...newCust, city: e.target.value })} className={inputClass}>
                      {cities.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="sm:col-span-2">
                    <span className={labelClass}>Address</span>
                    <input value={newCust.address} onChange={(e) => setNewCust({ ...newCust, address: e.target.value })} placeholder="House, road, area" className={inputClass} />
                  </label>
                </div>
              )}
            </div>
          </Card>

          {/* ── 2. Products ── */}
          <Card className="p-0">
            <StepHeader step={2} title={pre ? "Pre-order products" : "Products"} done={lines.length > 0} accent={accent}>
              {lines.length > 0 && (
                <span className="text-sm text-neutral-500">
                  {qtyTotal} {qtyTotal === 1 ? "unit" : "units"}
                </span>
              )}
            </StepHeader>

            <div className="p-5 sm:p-6">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && productMatches[0]) {
                      e.preventDefault();
                      addProduct(productMatches[0]);
                    } else if (e.key === "Escape") setQ("");
                  }}
                  placeholder={pre ? "Search upcoming products…" : "Search in-stock products…"}
                  aria-label="Search product"
                  className={cn(inputClass, "pl-10 pr-10")}
                />
                {q && (
                  <button
                    onClick={() => setQ("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
                  >
                    <X className="size-4" />
                  </button>
                )}
                {q.trim() && (
                  <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
                    {productMatches.map((p) => (
                      <li key={p.id}>
                        <button onClick={() => addProduct(p)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt="" className="size-10 shrink-0 rounded-lg bg-neutral-50 object-cover" />
                          <span className="min-w-0 flex-1 text-sm">
                            <span className="line-clamp-1 font-medium text-neutral-900">{p.name}</span>
                            <span className="text-xs text-neutral-500">
                              {p.preOrder
                                ? `Launch ${formatDate(p.preOrder.releaseDate)} · deposit ${formatTaka(p.preOrder.deposit)}`
                                : `${p.stock} in stock`}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-semibold">{formatTaka(p.price)}</span>
                          <Plus className="size-4 shrink-0 text-orange-500" />
                        </button>
                      </li>
                    ))}
                    {productMatches.length === 0 && <li className="px-4 py-4 text-sm text-neutral-500">No products match “{q.trim()}”.</li>}
                  </ul>
                )}
              </div>

              {lines.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {lines.map((l) => {
                    const max = pre ? 99 : l.product.stock;
                    return (
                      <li key={l.key} className="rounded-xl border border-neutral-200 p-3 sm:p-4">
                        <div className="flex gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={l.product.image} alt="" className="size-14 shrink-0 rounded-lg border border-neutral-100 bg-neutral-50 object-cover sm:size-16" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-medium text-neutral-900">{l.product.name}</p>
                                <p className="text-xs text-neutral-500">
                                  {formatTaka(l.product.price)} each
                                  {!pre && ` · ${l.product.stock} in stock`}
                                  {pre && l.product.preOrder && ` · deposit ${formatTaka(l.product.preOrder.deposit)}`}
                                </p>
                              </div>
                              <button
                                onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                                className={cn(btn.ghostDanger, "shrink-0")}
                                aria-label={`Remove ${l.product.name}`}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {l.product.colors && (
                                <select
                                  value={l.color}
                                  onChange={(e) => patch(l.key, { color: e.target.value })}
                                  aria-label="Color"
                                  className="h-9 rounded-lg border border-neutral-200 bg-white px-2 text-xs outline-none focus:border-orange-400"
                                >
                                  {l.product.colors.map((c) => (
                                    <option key={c}>{c}</option>
                                  ))}
                                </select>
                              )}
                              {l.product.storage && (
                                <select
                                  value={l.storage}
                                  onChange={(e) => patch(l.key, { storage: e.target.value })}
                                  aria-label="Storage"
                                  className="h-9 rounded-lg border border-neutral-200 bg-white px-2 text-xs outline-none focus:border-orange-400"
                                >
                                  {l.product.storage.map((c) => (
                                    <option key={c}>{c}</option>
                                  ))}
                                </select>
                              )}
                              <div className="flex h-9 items-center rounded-lg border border-neutral-200 bg-white">
                                <button
                                  onClick={() => patch(l.key, { qty: Math.max(1, l.qty - 1) })}
                                  disabled={l.qty <= 1}
                                  className="flex size-9 items-center justify-center text-neutral-600 hover:text-orange-600 disabled:opacity-30"
                                  aria-label="Decrease"
                                >
                                  <Minus className="size-3.5" />
                                </button>
                                <span className="w-7 text-center text-sm font-semibold tabular-nums">{l.qty}</span>
                                <button
                                  onClick={() => patch(l.key, { qty: Math.min(max, l.qty + 1) })}
                                  disabled={l.qty >= max}
                                  className="flex size-9 items-center justify-center text-neutral-600 hover:text-orange-600 disabled:opacity-30"
                                  aria-label="Increase"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              </div>
                              <span className="ml-auto text-sm font-bold tabular-nums text-neutral-900">{formatTaka(l.product.price * l.qty)}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-neutral-200 p-5 text-center">
                  <Package className="mx-auto size-8 text-neutral-300" />
                  <p className="mt-2 text-sm text-neutral-500">Search above or quick-add a product.</p>
                </div>
              )}

              {quickAdd.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Quick add</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                    {quickAdd.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addProduct(p)}
                        className="flex w-44 shrink-0 items-center gap-2 rounded-xl border border-neutral-200 p-2 text-left transition hover:border-orange-300 hover:bg-orange-50/40"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt="" className="size-10 shrink-0 rounded-lg bg-neutral-50 object-cover" />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium text-neutral-900">{p.name}</span>
                          <span className="block text-xs font-semibold text-orange-600">{formatTaka(p.price)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Summary ── */}
        <Card className={cn("p-0 xl:sticky xl:top-24", pre && "border-violet-200")}>
          <div className="border-b border-neutral-100 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-neutral-900">Summary</h2>
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            <dl className="space-y-3 text-sm">
              <Row label={`Items (${qtyTotal})`} value={formatTaka(subtotal)} />
              {!pre && (
                <MoneyInput label="Delivery fee" value={delivery} onChange={setDelivery} placeholder={String(deliveryFee)} />
              )}
              <MoneyInput label="Discount" value={discount} onChange={setDiscount} placeholder="0" />
              <div className="flex items-baseline justify-between border-t border-dashed border-neutral-200 pt-3">
                <dt className="font-semibold text-neutral-900">Total</dt>
                <dd className="text-2xl font-bold tabular-nums text-neutral-900">{formatTaka(total)}</dd>
              </div>
              {pre && <Row label="Required deposit" value={formatTaka(depositDue)} accent="violet" />}
            </dl>

            <div>
              <p className={labelClass}>{pre ? "Deposit paid via" : "Payment method"}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
                {methods.map((m) => {
                  const Icon = methodIcons[m];
                  const selected = method === m;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setMethod(m);
                        setPaid("");
                      }}
                      aria-pressed={selected}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition",
                        selected
                          ? pre
                            ? "border-violet-500 bg-violet-50 text-violet-700 ring-1 ring-violet-500"
                            : "border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="leading-tight">{paymentLabels[m]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="paid-now">
                {pre ? "Deposit received" : "Amount received now"}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400">৳</span>
                <input
                  id="paid-now"
                  type="number"
                  min={0}
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  placeholder={String(defaultPaid)}
                  className={cn(inputClass, "pl-8 tabular-nums")}
                />
              </div>
              <div className="mt-2 flex gap-2">
                {[
                  ["None", "0"],
                  [pre ? "Deposit" : "Full", String(pre ? depositDue : total)],
                ].map(([label, v]) => (
                  <button
                    key={label}
                    onClick={() => setPaid(v)}
                    className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:border-orange-300 hover:text-orange-600"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <dl className="mt-3 space-y-1.5 rounded-xl bg-neutral-50 p-3 text-sm">
                <Row label="Received" value={formatTaka(paidAmt)} />
                <Row label={pre ? "Balance on delivery" : "Due"} value={formatTaka(due)} accent={due > 0 ? "rose" : undefined} />
              </dl>
            </div>

            <label className="block">
              <span className={labelClass}>Internal note</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="e.g. Ordered by phone call"
                className={cn(inputClass, "h-auto py-2.5")}
              />
            </label>

            <ul className="space-y-1.5 text-xs">
              <Check2 done={customerReady} label="Customer selected" />
              <Check2 done={lines.length > 0} label="At least one product added" />
            </ul>

            <button
              onClick={submit}
              disabled={!ready}
              className={cn(
                btn.primary,
                "hidden h-12 w-full shadow-lg shadow-orange-500/20 xl:flex",
                pre && "bg-violet-600 shadow-violet-600/20 hover:bg-violet-700"
              )}
            >
              {pre ? "Create pre-order" : "Create order"} · {formatTaka(total)}
            </button>
          </div>
        </Card>
      </div>

      {/* Mobile / tablet sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur lg:left-64 xl:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neutral-500">
              {qtyTotal} {qtyTotal === 1 ? "unit" : "units"} · due {formatTaka(due)}
            </p>
            <p className="text-lg font-bold tabular-nums text-neutral-900">{formatTaka(total)}</p>
          </div>
          <button
            onClick={submit}
            disabled={!ready}
            className={cn(btn.primary, "h-11 px-6", pre && "bg-violet-600 hover:bg-violet-700")}
          >
            {pre ? "Create pre-order" : "Create order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  step,
  title,
  done,
  accent,
  children,
}: {
  step: number;
  title: string;
  done: boolean;
  accent: "orange" | "violet";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-sm font-bold",
            done ? "bg-emerald-500 text-white" : accent === "violet" ? "bg-violet-600 text-white" : "bg-neutral-900 text-white"
          )}
        >
          {done ? <Check className="size-4" strokeWidth={3} /> : step}
        </span>
        <h2 className="font-semibold text-neutral-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">৳</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="h-9 w-32 rounded-lg border border-neutral-200 bg-neutral-50 pl-6 pr-2.5 text-right text-sm tabular-nums outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
        />
      </dd>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: "violet" | "rose" }) {
  return (
    <div
      className={cn(
        "flex justify-between",
        accent === "violet" && "font-semibold text-violet-700",
        accent === "rose" && "font-semibold text-rose-600"
      )}
    >
      <dt className={accent ? "" : "text-neutral-500"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function Check2({ done, label }: { done: boolean; label: string }) {
  return (
    <li className={cn("flex items-center gap-2", done ? "text-emerald-600" : "text-neutral-400")}>
      {done ? <Check className="size-3.5" strokeWidth={3} /> : <CircleDashed className="size-3.5" />}
      {label}
    </li>
  );
}
