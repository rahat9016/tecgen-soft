"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  CircleAlert,
  Heart,
  MapPin,
  Package,
  Phone,
  Mail,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { currentUser, orderDue, useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatDate, formatTaka } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import OrderRow from "@/src/components/gadgets/account/OrderRow";
import OrderTracker from "@/src/components/gadgets/OrderTracker";
import { EmptyState, StatusBadge } from "@/src/components/gadgets/shared";

export default function AccountOverviewPage() {
  const db = useGadgetDB();
  const user = currentUser(db);
  const orders = db.orders.filter((o) => o.customerId === user.id);
  const live = orders.filter((o) => o.status !== "cancelled");
  const spent = live.reduce((s, o) => s + o.paid, 0);
  const due = live.reduce((s, o) => s + orderDue(o), 0);
  const active = orders.find((o) => o.status !== "delivered" && o.status !== "cancelled");

  const stats = [
    {
      icon: Package,
      label: "Orders",
      value: orders.filter((o) => o.type === "regular").length,
      href: "/gadgets/account/orders",
      tile: "bg-sky-50 text-sky-600",
    },
    {
      icon: CalendarClock,
      label: "Pre-orders",
      value: orders.filter((o) => o.type === "preorder").length,
      href: "/gadgets/account/pre-orders",
      tile: "bg-violet-50 text-violet-600",
    },
    {
      icon: Heart,
      label: "Wishlist",
      value: db.wishlist.length,
      href: "/gadgets/account/wishlist",
      tile: "bg-rose-50 text-rose-600",
    },
    {
      icon: Wallet,
      label: "Total paid",
      value: formatTaka(spent),
      href: "/gadgets/account/orders",
      tile: "bg-emerald-50 text-emerald-600",
      sub: due > 0 ? `${formatTaka(due)} due` : undefined,
    },
  ];

  const checks = [
    { label: "Profile photo", done: !!user.avatar },
    { label: "Phone number", done: !!user.phone },
    { label: "Email address", done: !!user.email },
    { label: "Delivery address", done: !!user.address },
  ];
  const completeness = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">Hello, {user.name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-sm text-neutral-500">Track your orders, pre-orders and manage your profile.</p>
        </div>
        <Link
          href="/gadgets/shop"
          className="flex h-10 items-center gap-2 rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-orange-500"
        >
          <ShoppingBag className="size-4" /> Continue shopping
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, href, tile, sub }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className={cn("flex size-10 items-center justify-center rounded-xl", tile)}>
                <Icon className="size-5" />
              </span>
              <ArrowRight className="size-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
            </div>
            <p className="mt-4 truncate text-xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500">
              {label}
              {sub && <span className="ml-1 font-medium text-orange-600">· {sub}</span>}
            </p>
          </Link>
        ))}
      </div>

      {active && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Active order</p>
              <h2 className="mt-1 flex flex-wrap items-center gap-2 text-lg font-semibold text-neutral-900">
                #{active.id} <StatusBadge status={active.status} />
              </h2>
              <p className="text-xs text-neutral-500">
                Placed {formatDate(active.createdAt)} · {formatTaka(active.total)}
              </p>
            </div>
            <Link
              href={`/gadgets/account/orders/${active.id}`}
              className="flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition hover:border-orange-400 hover:text-orange-600"
            >
              View details <ArrowRight className="size-4" />
            </Link>
          </div>
          <OrderTracker order={active} />
        </section>
      )}

      <div className="grid gap-6 [&>*]:min-w-0 xl:grid-cols-[1fr_300px]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Recent orders</h2>
            <Link href="/gadgets/account/orders" className="text-sm font-medium text-orange-500 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {orders.slice(0, 3).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
            {orders.length === 0 && (
              <EmptyState
                icon={Package}
                title="No orders yet"
                text="When you place an order it will show up here."
                action={
                  <Link href="/gadgets/shop" className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white">
                    Start shopping
                  </Link>
                }
              />
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Profile</h2>
              <Link href="/gadgets/account/profile" className="text-sm font-medium text-orange-500 hover:underline">
                Edit
              </Link>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                <span className="text-neutral-700">{user.phone || <em className="text-neutral-400">Not added</em>}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                <span className="min-w-0 truncate text-neutral-700">
                  {user.email || <em className="text-neutral-400">Not added</em>}
                </span>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                <span className="text-neutral-700">
                  {user.address ? `${user.address}, ${user.city}` : <em className="text-neutral-400">No delivery address</em>}
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl bg-[#efefef] p-5">
            <div className="flex items-center justify-between text-sm">
              <h2 className="font-semibold text-neutral-900">Profile completeness</h2>
              <span className="font-bold text-neutral-900">{completeness}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div
                className={cn("h-full rounded-full transition-all", completeness === 100 ? "bg-emerald-500" : "bg-orange-500")}
                style={{ width: `${completeness}%` }}
              />
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2">
                  {c.done ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <CircleAlert className="size-4 text-orange-500" />
                  )}
                  <span className={c.done ? "text-neutral-600" : "font-medium text-neutral-900"}>{c.label}</span>
                </li>
              ))}
            </ul>
            {completeness < 100 && (
              <Link
                href="/gadgets/account/profile"
                className="mt-4 flex h-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white hover:bg-orange-500"
              >
                Complete profile
              </Link>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
