"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, Lock, ShoppingBag } from "lucide-react";
import { formatTaka } from "@/src/data/gadgets";
import {
  cartDetails,
  currentUser,
  deliveryFeeFor,
  placeOrder,
  useGadgetDB,
  useHydrated,
} from "@/src/lib/gadget-store/store";
import { formatDate, paymentLabels } from "@/src/lib/gadget-store/format";
import type { PaymentMethod } from "@/src/lib/gadget-store/types";
import { cn } from "@/src/lib/utils";
import { EmptyState, Field, inputClass, PageLoader } from "./shared";

export default function Checkout() {
  const db = useGadgetDB();
  const hydrated = useHydrated();
  if (!hydrated) return <PageLoader />;
  // Mount the form only once the client store is loaded so the profile prefill is real.
  return <CheckoutForm key={db.currentUserId} />;
}

function CheckoutForm() {
  const db = useGadgetDB();
  const params = useSearchParams();
  const router = useRouter();
  const user = currentUser(db);

  const buySlug = params.get("buy");
  const buyProduct = buySlug ? db.products.find((p) => p.slug === buySlug) : undefined;
  const lines = buyProduct
    ? [{ product: buyProduct, qty: Math.max(1, Number(params.get("qty")) || 1), variant: params.get("variant") ?? undefined }]
    : cartDetails(db).lines.map((l) => ({ product: l.product, qty: l.qty, variant: l.variant }));

  const pre = buyProduct?.preOrder ?? null;
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    email: user.email,
    address: user.address,
    city: user.city || "Dhaka",
    note: "",
  });
  const [method, setMethod] = useState<PaymentMethod>(pre ? "bkash" : "cod");
  const [submitting, setSubmitting] = useState(false);

  if (lines.length === 0) {
    return (
      <div className="container mt-8">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out"
          action={
            <Link href="/gadgets/shop" className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white">
              Browse gadgets
            </Link>
          }
        />
      </div>
    );
  }

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const deliveryFee = pre ? 0 : deliveryFeeFor(subtotal, form.city);
  const total = subtotal + deliveryFee;
  const qtyTotal = lines.reduce((s, l) => s + l.qty, 0);
  const payNow = pre ? pre.deposit * qtyTotal : method === "cod" ? 0 : total;

  const methods: PaymentMethod[] = pre ? ["bkash", "nagad", "card"] : ["cod", "bkash", "nagad", "card", "emi"];

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { note, ...customer } = form;
    const id = placeOrder({ customer, lines, paymentMethod: method, note: note || undefined, clearCart: !buyProduct });
    router.push(`/gadgets/account/orders/${id}?placed=1`);
  };

  return (
    <form onSubmit={submit} className="container mt-8 grid gap-8 [&>*]:min-w-0 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">{pre ? "Pre-order Checkout" : "Checkout"}</h1>
          {pre && (
            <p className="mt-2 flex items-center gap-2 text-sm text-violet-700">
              <CalendarClock className="size-4" /> Expected launch {formatDate(pre.releaseDate)} — pay the deposit now,
              the rest on delivery.
            </p>
          )}
        </div>

        <section>
          <h2 className="font-semibold text-neutral-900">Delivery details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input required value={form.name} onChange={set("name")} className={inputClass} />
            </Field>
            <Field label="Phone">
              <input required type="tel" pattern="[0-9+\- ]{11,15}" value={form.phone} onChange={set("phone")} className={inputClass} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={set("email")} className={inputClass} />
            </Field>
            <Field label="City">
              <select value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputClass}>
                {["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Cumilla"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <input required value={form.address} onChange={set("address")} className={inputClass} />
            </Field>
            <Field label="Order note (optional)" className="sm:col-span-2">
              <textarea value={form.note} onChange={set("note")} rows={2} className={cn(inputClass, "h-auto py-2.5")} />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-neutral-900">{pre ? "Pay deposit with" : "Payment method"}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {methods.map((m) => (
              <label
                key={m}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition",
                  method === m ? "border-orange-400 bg-orange-50" : "border-neutral-200 hover:border-orange-200"
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={method === m}
                  onChange={() => setMethod(m)}
                  className="accent-orange-500"
                />
                <span className="font-medium text-neutral-900">{paymentLabels[m]}</span>
                {m === "emi" && <span className="ml-auto text-xs text-neutral-500">0% up to 12 mo</span>}
              </label>
            ))}
          </div>
          {method !== "cod" && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
              <Lock className="size-3.5" /> Demo store — no real payment is taken.
            </p>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-2xl bg-neutral-50 p-6 lg:sticky lg:top-36">
        <h2 className="font-semibold text-neutral-900">Your order</h2>
        <ul className="mt-4 space-y-3">
          {lines.map((l) => (
            <li key={l.product.id + (l.variant ?? "")} className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.product.image} alt="" className="size-14 rounded-lg bg-white object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="line-clamp-1 font-medium text-neutral-900">{l.product.name}</p>
                <p className="text-xs text-neutral-500">
                  {l.variant ? `${l.variant} · ` : ""}Qty {l.qty}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatTaka(l.product.price * l.qty)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Subtotal</dt>
            <dd>{formatTaka(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Delivery</dt>
            <dd>{deliveryFee ? formatTaka(deliveryFee) : "Free"}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd>{formatTaka(total)}</dd>
          </div>
          <div className="flex justify-between text-orange-600">
            <dt>{pre ? "Deposit now" : "Pay now"}</dt>
            <dd className="font-semibold">{formatTaka(payNow)}</dd>
          </div>
          {total - payNow > 0 && (
            <div className="flex justify-between text-neutral-500">
              <dt>Due on delivery</dt>
              <dd>{formatTaka(total - payNow)}</dd>
            </div>
          )}
        </dl>
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "mt-5 h-12 w-full rounded-full text-sm font-semibold text-white disabled:opacity-60",
            pre ? "bg-violet-600 hover:bg-violet-700" : "bg-orange-500 hover:bg-orange-600"
          )}
        >
          {pre ? "Confirm Pre-order" : "Place Order"}
        </button>
      </aside>
    </form>
  );
}
