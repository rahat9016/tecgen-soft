"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useController, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Banknote,
  CalendarClock,
  CalendarRange,
  Check,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Wallet,
} from "lucide-react";
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
import ControlledInputField from "@/src/components/shared/FromController/ControlledInputField";
import ControlledSelectField from "@/src/components/shared/FromController/ControlledSelectField";
import ControlledTextareaField from "@/src/components/shared/FromController/ControlledTextareaField";
import InputLabel from "@/src/components/shared/InputLabel";
import { EmptyState, PageLoader } from "./shared";
import { checkoutCities, checkoutSchema, type CheckoutFormValues } from "./checkoutSchema";

const fieldClass =
  "h-11 rounded-xl border-neutral-200 bg-neutral-50 px-3.5 text-sm shadow-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";
const labelClass = "mb-1.5 text-sm font-medium text-neutral-700";

const paymentMeta: Record<PaymentMethod, { icon: React.ComponentType<{ className?: string }>; hint: string; tile: string }> = {
  cod: { icon: Banknote, hint: "Pay when you receive", tile: "bg-emerald-50 text-emerald-600" },
  bkash: { icon: Smartphone, hint: "bKash mobile wallet", tile: "bg-pink-50 text-pink-600" },
  nagad: { icon: Wallet, hint: "Nagad mobile wallet", tile: "bg-orange-50 text-orange-600" },
  card: { icon: CreditCard, hint: "Visa, Mastercard, Amex", tile: "bg-sky-50 text-sky-600" },
  emi: { icon: CalendarRange, hint: "0% EMI up to 12 months", tile: "bg-violet-50 text-violet-600" },
  cash: { icon: Banknote, hint: "", tile: "bg-neutral-100 text-neutral-600" },
  bank: { icon: Banknote, hint: "", tile: "bg-neutral-100 text-neutral-600" },
};

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
  const methods: PaymentMethod[] = pre ? ["bkash", "nagad", "card"] : ["cod", "bkash", "nagad", "card", "emi"];

  const form = useForm<CheckoutFormValues>({
    resolver: yupResolver(checkoutSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      email: user.email,
      address: user.address,
      city: checkoutCities.includes(user.city) ? user.city : "Dhaka",
      note: "",
      payment: pre ? "bkash" : "cod",
    },
  });
  const [city, method] = useWatch({ control: form.control, name: ["city", "payment"] });
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
  const deliveryFee = pre ? 0 : deliveryFeeFor(subtotal, city);
  const total = subtotal + deliveryFee;
  const qtyTotal = lines.reduce((s, l) => s + l.qty, 0);
  const payNow = pre ? pre.deposit * qtyTotal : method === "cod" ? 0 : total;

  const submit = ({ note, payment, email, ...customer }: CheckoutFormValues) => {
    setSubmitting(true);
    const id = placeOrder({
      customer: { ...customer, email },
      lines,
      paymentMethod: payment,
      note: note || undefined,
      clearCart: !buyProduct,
    });
    router.push(`/gadgets/account/orders/${id}?placed=1`);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        noValidate
        className="container mt-8 grid items-start gap-6 [&>*]:min-w-0 lg:grid-cols-[1fr_400px] lg:gap-8"
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">
              {pre ? "Pre-order Checkout" : "Checkout"}
            </h1>
            {pre && (
              <p className="mt-2 flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-700">
                <CalendarClock className="size-4 shrink-0" /> Expected launch {formatDate(pre.releaseDate)} — pay the
                deposit now, the rest on delivery.
              </p>
            )}
          </div>

          <Section step={1} title="Delivery details" icon={MapPin}>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <div>
                <InputLabel label="Full name" required className={labelClass} />
                <ControlledInputField name="name" placeholder="Your full name" className={fieldClass} />
              </div>
              <div>
                <InputLabel label="Phone" required className={labelClass} />
                <ControlledInputField name="phone" type="tel" placeholder="01XXX-XXXXXX" className={fieldClass} />
              </div>
              <div>
                <InputLabel label="Email" className={labelClass} />
                <ControlledInputField name="email" type="email" placeholder="you@example.com" className={fieldClass} />
              </div>
              <div>
                <InputLabel label="City" required className={labelClass} />
                <ControlledSelectField
                  name="city"
                  placeholder="Select city"
                  options={checkoutCities.map((c) => ({ label: c, value: c }))}
                  className={fieldClass}
                />
              </div>
              <div className="sm:col-span-2">
                <InputLabel label="Address" required className={labelClass} />
                <ControlledInputField name="address" placeholder="House, road, area" className={fieldClass} />
              </div>
              <div className="sm:col-span-2">
                <InputLabel label="Order note" isOptional className={labelClass} />
                <ControlledTextareaField
                  name="note"
                  placeholder="Anything we should know about delivery?"
                  className={cn(fieldClass, "h-24 py-2.5")}
                />
              </div>
            </div>
          </Section>

          <Section step={2} title={pre ? "Pay deposit with" : "Payment method"} icon={CreditCard}>
            <PaymentPicker methods={methods} />
            {method !== "cod" && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
                <Lock className="size-3.5" /> Demo store — no real payment is taken.
              </p>
            )}
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-36">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Order summary</h2>
              <span className="text-sm text-neutral-500">
                {qtyTotal} {qtyTotal === 1 ? "item" : "items"}
              </span>
            </div>

            <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
              {lines.map((l) => (
                <li key={l.product.id + (l.variant ?? "")} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={l.product.image}
                      alt=""
                      className="size-16 rounded-xl border border-neutral-100 bg-neutral-50 object-cover"
                    />
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                      {l.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-neutral-900">{l.product.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {l.variant ? `${l.variant} · ` : ""}
                      {formatTaka(l.product.price)} each
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-neutral-900">{formatTaka(l.product.price * l.qty)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 border-t border-neutral-100 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd className="font-medium text-neutral-900">{formatTaka(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Delivery</dt>
                <dd className={deliveryFee ? "font-medium text-neutral-900" : "font-medium text-emerald-600"}>
                  {deliveryFee ? formatTaka(deliveryFee) : "Free"}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-neutral-200 pt-4">
              <span className="font-semibold text-neutral-900">Total</span>
              <span className="text-2xl font-bold text-neutral-900">{formatTaka(total)}</span>
            </div>

            <dl
              className={cn(
                "mt-4 space-y-2 rounded-xl p-4 text-sm",
                pre ? "bg-violet-50" : "bg-orange-50"
              )}
            >
              <div className={cn("flex justify-between font-semibold", pre ? "text-violet-700" : "text-orange-700")}>
                <dt>{pre ? "Deposit now" : "Pay now"}</dt>
                <dd>{formatTaka(payNow)}</dd>
              </div>
              {total - payNow > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <dt>Due on delivery</dt>
                  <dd>{formatTaka(total - payNow)}</dd>
                </div>
              )}
            </dl>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-lg transition disabled:opacity-60",
                pre
                  ? "bg-violet-600 shadow-violet-600/25 hover:bg-violet-700"
                  : "bg-orange-500 shadow-orange-500/25 hover:bg-orange-600"
              )}
            >
              <Lock className="size-4" />
              {submitting ? "Placing order…" : pre ? "Confirm Pre-order" : "Place Order"}
            </button>
            <p className="mt-3 text-center text-[11px] text-neutral-400">
              By placing this order you agree to our terms &amp; replacement policy.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#efefef] p-4 text-sm text-neutral-700">
            <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
            100% original products with official warranty
          </div>
        </aside>
      </form>
    </FormProvider>
  );
}

function Section({
  step,
  title,
  icon: Icon,
  children,
}: {
  step: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-neutral-100 pb-4">
        <span className="flex size-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
          {step}
        </span>
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <Icon className="ml-auto size-5 text-neutral-400" />
      </div>
      {children}
    </section>
  );
}

function PaymentPicker({ methods }: { methods: PaymentMethod[] }) {
  const { field, fieldState } = useController<CheckoutFormValues, "payment">({ name: "payment" });

  return (
    <>
      <div role="radiogroup" aria-label="Payment method" className="grid gap-3 sm:grid-cols-2">
        {methods.map((m) => {
          const { icon: Icon, hint, tile } = paymentMeta[m];
          const selected = field.value === m;
          return (
            <label
              key={m}
              className={cn(
                "relative flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition",
                selected
                  ? "border-orange-500 bg-orange-50/60 ring-1 ring-orange-500"
                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              )}
            >
              <input
                type="radio"
                name={field.name}
                value={m}
                checked={selected}
                onChange={() => field.onChange(m)}
                onBlur={field.onBlur}
                className="sr-only"
              />
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", tile)}>
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-neutral-900">{paymentLabels[m]}</span>
                <span className="block text-xs text-neutral-500">{hint}</span>
              </span>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border transition",
                  selected ? "border-orange-500 bg-orange-500 text-white" : "border-neutral-300 bg-white"
                )}
              >
                {selected && <Check className="size-3" strokeWidth={3} />}
              </span>
            </label>
          );
        })}
      </div>
      {fieldState.error && <p className="mt-2 pl-2 text-xs text-rose-500">{fieldState.error.message}</p>}
    </>
  );
}
