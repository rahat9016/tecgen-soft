"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarClock,
  ChevronRight,
  CreditCard,
  Heart,
  Minus,
  PackageX,
  Plus,
  RefreshCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "react-toastify";
import { formatTaka } from "@/src/data/gadgets";
import { addToCart, toggleWishlist, useGadgetDB, useHydrated } from "@/src/lib/gadget-store/store";
import { daysUntil, formatDate } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import ProductRail from "./ProductRail";
import { EmptyState, PageLoader } from "./shared";

const perks = [
  { icon: BadgeCheck, text: "100% original with official warranty" },
  { icon: CreditCard, text: "0% EMI up to 12 months on selected cards" },
  { icon: Truck, text: "Inside Dhaka delivery within 24 hours" },
  { icon: RefreshCcw, text: "7-day easy replacement" },
];

const tabs = ["Description", "Specifications", "Warranty & Delivery"] as const;

export default function ProductDetails({ slug }: { slug: string }) {
  const db = useGadgetDB();
  const hydrated = useHydrated();
  const router = useRouter();
  const item = db.products.find((p) => p.slug === slug);

  const [color, setColor] = useState<string | undefined>();
  const [storage, setStorage] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Description");
  const [emiMonths, setEmiMonths] = useState(12);

  const related = useMemo(() => {
    if (!item) return [];
    const others = db.products.filter((p) => p.active && p.id !== item.id);
    return [
      ...others.filter((p) => p.category === item.category),
      ...others.filter((p) => p.category !== item.category && p.brand === item.brand),
    ].slice(0, 10);
  }, [db.products, item]);

  if (!item) return hydrated ? <NotFound /> : <PageLoader />;

  const selColor = color ?? item.colors?.[0];
  const selStorage = storage ?? item.storage?.[0];
  const variant = [selColor, selStorage].filter(Boolean).join(" · ") || undefined;
  const save = item.originalPrice ? item.originalPrice - item.price : 0;
  const pre = item.preOrder;
  const outOfStock = !pre && item.stock === 0;
  const wished = db.wishlist.includes(item.id);
  const daysLeft = pre ? daysUntil(pre.releaseDate) : 0;

  const onAdd = () => {
    addToCart(item.id, qty, variant);
    toast.success(`${item.name} added to cart`);
  };

  const buyNow = () => {
    const q = new URLSearchParams({ buy: item.slug, qty: String(qty) });
    if (variant) q.set("variant", variant);
    router.push(`/gadgets/checkout?${q.toString()}`);
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="container mt-5 flex items-center gap-1 text-xs text-neutral-500">
        <Link href="/gadgets" className="hover:text-orange-500">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/gadgets/shop?category=${encodeURIComponent(item.category)}`} className="hover:text-orange-500">
          {item.category}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-neutral-800">{item.name}</span>
      </nav>

      <section className="container mt-5 grid gap-8 md:grid-cols-2 lg:gap-14">
        <div className="md:sticky md:top-36 md:self-start">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-50">
            {pre ? (
              <span className="absolute left-4 top-4 z-10 rounded-lg bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                PRE-ORDER
              </span>
            ) : (
              save > 0 && (
                <span className="absolute left-4 top-4 z-10 rounded-lg bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                  -{Math.round((save / item.originalPrice!) * 100)}%
                </span>
              )
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.name} className="size-full object-cover" />
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                href={`/gadgets/shop?brand=${encodeURIComponent(item.brand)}`}
                className="text-xs font-semibold uppercase tracking-widest text-orange-500 hover:underline"
              >
                {item.brand}
              </Link>
              <h1 className="mt-2 text-2xl font-bold text-neutral-900 md:text-3xl">{item.name}</h1>
            </div>
            <button
              onClick={() => toggleWishlist(item.id)}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wished}
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:text-rose-500"
            >
              <Heart className={cn("size-5", wished && "fill-rose-500 text-rose-500")} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {pre ? (
              <span className="rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-700">Pre-order open</span>
            ) : outOfStock ? (
              <span className="rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-600">Out of stock</span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                In stock{hydrated && item.stock <= 5 ? ` — only ${item.stock} left` : ""}
              </span>
            )}
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">{item.category}</span>
            {item.isNew && <span className="rounded-full bg-neutral-900 px-3 py-1 text-white">New Arrival</span>}
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-neutral-900">{formatTaka(item.price)}</span>
            {item.originalPrice && (
              <span className="text-lg text-neutral-400 line-through">{formatTaka(item.originalPrice)}</span>
            )}
            {save > 0 && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                Save {formatTaka(save)}
              </span>
            )}
          </div>

          {pre && (
            <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <p className="flex items-center gap-2 font-semibold text-violet-900">
                <CalendarClock className="size-5" /> Expected launch {formatDate(pre.releaseDate)}
                {hydrated && daysLeft > 0 && (
                  <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs text-white">{daysLeft} days left</span>
                )}
              </p>
              <p className="mt-2 text-sm text-violet-900/80">
                Reserve now with a refundable deposit of <b>{formatTaka(pre.deposit)}</b>. Pay the remaining{" "}
                <b>{formatTaka(item.price - pre.deposit)}</b> on delivery. Pre-order customers get priority dispatch.
              </p>
            </div>
          )}

          {item.colors && (
            <OptionGroup label="Color" value={selColor} options={item.colors} onChange={setColor} />
          )}
          {item.storage && (
            <OptionGroup label="Storage" value={selStorage} options={item.storage} onChange={setStorage} />
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center rounded-full border border-neutral-200">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex size-12 items-center justify-center text-neutral-600 hover:text-orange-500"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center font-semibold" aria-live="polite">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => (pre ? Math.min(2, q + 1) : Math.min(item.stock || 1, q + 1)))}
                aria-label="Increase quantity"
                className="flex size-12 items-center justify-center text-neutral-600 hover:text-orange-500"
              >
                <Plus className="size-4" />
              </button>
            </div>
            {pre ? (
              <button
                onClick={buyNow}
                className="flex h-12 items-center gap-2 rounded-full bg-violet-600 px-8 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <CalendarClock className="size-4" /> Pre-order — pay {formatTaka(pre.deposit * qty)}
              </button>
            ) : (
              <>
                <button
                  onClick={onAdd}
                  disabled={outOfStock}
                  className="flex h-12 items-center gap-2 rounded-full bg-neutral-900 px-6 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-40"
                >
                  <ShoppingBag className="size-4" /> Add to Cart
                </button>
                <button
                  onClick={buyNow}
                  disabled={outOfStock}
                  className="h-12 rounded-full bg-orange-500 px-8 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40"
                >
                  Buy Now
                </button>
              </>
            )}
          </div>

          {!pre && (
            <div className="mt-6 rounded-2xl border border-neutral-100 p-4">
              <p className="text-sm font-semibold text-neutral-900">0% EMI plans</p>
              <div className="mt-3 flex gap-2">
                {[3, 6, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setEmiMonths(m)}
                    className={cn(
                      "flex-1 rounded-xl border px-3 py-2 text-left transition",
                      emiMonths === m ? "border-orange-400 bg-orange-50" : "border-neutral-200 hover:border-orange-200"
                    )}
                  >
                    <span className="block text-xs text-neutral-500">{m} months</span>
                    <span className="block text-sm font-bold text-neutral-900">
                      {formatTaka(Math.ceil(item.price / m))}
                      <span className="text-xs font-normal text-neutral-500">/mo</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-400">EBL, City Bank, BRAC Bank & 20+ bank credit cards.</p>
            </div>
          )}

          <ul className="mt-6 grid gap-3 rounded-2xl bg-neutral-50 p-5 sm:grid-cols-2">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-neutral-700">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-orange-500">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mt-14">
        <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-neutral-200">
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "-mb-px shrink-0 border-b-2 pb-3 text-sm font-semibold transition",
                tab === t ? "border-orange-500 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-800"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="max-w-3xl py-6">
          {tab === "Description" && <p className="leading-relaxed text-neutral-700">{item.description}</p>}
          {tab === "Specifications" && (
            <dl className="overflow-hidden rounded-2xl border border-neutral-100">
              {(item.specs ?? []).map((s, i) => (
                <div key={s.label} className={cn("grid grid-cols-[160px_1fr] gap-4 px-5 py-3 text-sm", i % 2 === 0 && "bg-neutral-50")}>
                  <dt className="font-medium text-neutral-500">{s.label}</dt>
                  <dd className="text-neutral-900">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === "Warranty & Delivery" && (
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-700">
              <li>Official brand warranty; claims handled at any gadgethub outlet.</li>
              <li>Inside Dhaka: delivery within 24 hours (৳80). Outside Dhaka: 2–4 days (৳150). Free over ৳20,000.</li>
              <li>7-day replacement for manufacturing defects with original box and accessories.</li>
              <li>Pre-order deposits are fully refundable until the product is dispatched.</li>
            </ul>
          )}
        </div>
      </section>

      <ProductRail title="Related" highlight="Products" items={related} />
    </>
  );
}

function OptionGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="text-sm text-neutral-500">
        {label}: <span className="font-semibold text-neutral-900">{value}</span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              value === o
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 text-neutral-700 hover:border-orange-400"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function NotFound() {
  return (
    <div className="container mt-10">
      <EmptyState
        icon={PackageX}
        title="Product not found"
        text="This product may have been removed."
        action={
          <Link href="/gadgets/shop" className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white">
            Browse gadgets
          </Link>
        }
      />
    </div>
  );
}
