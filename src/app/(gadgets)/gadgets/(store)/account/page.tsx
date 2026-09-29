"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, Heart, Package, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { currentUser, updateProfile, useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatTaka } from "@/src/lib/gadget-store/format";
import { Field, inputClass } from "@/src/components/gadgets/shared";
import OrderRow from "@/src/components/gadgets/account/OrderRow";

export default function AccountOverviewPage() {
  const db = useGadgetDB();
  const user = currentUser(db);
  const orders = db.orders.filter((o) => o.customerId === user.id);
  const spent = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.paid, 0);
  const [form, setForm] = useState({ name: user.name, phone: user.phone, email: user.email, address: user.address, city: user.city });

  const stats = [
    { icon: Package, label: "Orders", value: orders.filter((o) => o.type === "regular").length, href: "/gadgets/account/orders" },
    { icon: CalendarClock, label: "Pre-orders", value: orders.filter((o) => o.type === "preorder").length, href: "/gadgets/account/pre-orders" },
    { icon: Heart, label: "Wishlist", value: db.wishlist.length, href: "/gadgets/account/wishlist" },
    { icon: Wallet, label: "Total paid", value: formatTaka(spent), href: "/gadgets/account/orders" },
  ];

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Hello, {user.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage your orders, pre-orders and profile.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link key={label} href={href} className="rounded-2xl border border-neutral-100 p-4 transition hover:border-orange-200">
            <Icon className="size-5 text-orange-500" />
            <p className="mt-3 text-xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Recent orders</h2>
          <Link href="/gadgets/account/orders" className="text-sm text-orange-500 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {orders.slice(0, 3).map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
          {orders.length === 0 && <p className="text-sm text-neutral-500">No orders yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-100 p-6">
        <h2 className="font-semibold text-neutral-900">Profile & delivery address</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateProfile(form);
            toast.success("Profile updated");
          }}
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <Field label="Full name">
            <input required value={form.name} onChange={set("name")} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input required value={form.phone} onChange={set("phone")} className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set("email")} className={inputClass} />
          </Field>
          <Field label="City">
            <input value={form.city} onChange={set("city")} className={inputClass} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <input value={form.address} onChange={set("address")} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <button className="h-11 rounded-full bg-neutral-900 px-6 text-sm font-semibold text-white hover:bg-neutral-800">
              Save changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
