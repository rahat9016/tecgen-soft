"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  FilterX,
  MapPin,
  Plus,
  Search,
  ShoppingCart,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { orderDue, useGadgetDB } from "@/src/lib/gadget-store/store";
import type { Order, OrderStatus, PaymentMethod } from "@/src/lib/gadget-store/types";
import {
  daysUntil,
  formatDate,
  formatTaka,
  formatTime,
  paymentLabels,
  statusLabels,
} from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import { StatusBadge } from "../shared";
import AdminOrderQuickView from "./AdminOrderQuickView";
import { AdminHeader, btn, Card, daysAgoStart, FilterMenu, StatCard, Table, td, th } from "./kit";
import { PaymentBadge, paymentState, paymentStateLabels, statusDot, type PaymentState } from "./orderActions";

type StatusFilter = "all" | OrderStatus;
type DateFilter = "all" | "today" | "7" | "30" | "90";
type SortKey = "newest" | "oldest" | "total-desc" | "total-asc" | "due-desc";

const PAGE_SIZE = 12;
const statuses: StatusFilter[] = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const dateOptions: { value: DateFilter; label: string }[] = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];
const sortOptions: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "total-desc", label: "Total: high to low" },
  { value: "total-asc", label: "Total: low to high" },
  { value: "due-desc", label: "Due: high to low" },
];

const paymentDot: Record<PaymentState, string> = {
  paid: "bg-emerald-500",
  partial: "bg-amber-500",
  unpaid: "bg-rose-500",
  void: "bg-neutral-400",
};

const isStatus = (v: string | null): v is OrderStatus => !!v && statuses.includes(v as StatusFilter);

export default function AdminOrders({ preorders = false }: { preorders?: boolean }) {
  const db = useGadgetDB();
  const params = useSearchParams();
  const initialStatus = params.get("status");
  const [status, setStatus] = useState<StatusFilter>(isStatus(initialStatus) ? initialStatus : "all");
  const [q, setQ] = useState("");
  const [method, setMethod] = useState<"all" | PaymentMethod>("all");
  const [pay, setPay] = useState<"all" | PaymentState>("all");
  const [city, setCity] = useState("all");
  const [date, setDate] = useState<DateFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);

  const base = useMemo(
    () => db.orders.filter((o) => (preorders ? o.type === "preorder" : o.type === "regular")),
    [db.orders, preorders]
  );
  const methods = useMemo(() => [...new Set(base.map((o) => o.paymentMethod))], [base]);
  const cities = useMemo(() => [...new Set(base.map((o) => o.customer.city))].sort(), [base]);

  // Everything except the status tab, so tab counts reflect the other active filters.
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const digits = term.replace(/\D/g, "");
    const since = date === "all" ? 0 : daysAgoStart(date === "today" ? 1 : Number(date));
    return base.filter(
      (o) =>
        (method === "all" || o.paymentMethod === method) &&
        (pay === "all" || paymentState(o) === pay) &&
        (city === "all" || o.customer.city === city) &&
        new Date(o.createdAt).getTime() >= since &&
        (!term ||
          o.id.toLowerCase().includes(term) ||
          o.customer.name.toLowerCase().includes(term) ||
          o.items.some((l) => l.name.toLowerCase().includes(term)) ||
          (digits.length >= 3 && o.customer.phone.replace(/\D/g, "").includes(digits)))
    );
  }, [base, q, method, pay, city, date]);

  const shown = useMemo(() => {
    const list = status === "all" ? filtered : filtered.filter((o) => o.status === status);
    const due = (o: Order) => (o.status === "cancelled" ? 0 : orderDue(o));
    const sorters: Record<SortKey, (a: Order, b: Order) => number> = {
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
      "total-desc": (a, b) => b.total - a.total,
      "total-asc": (a, b) => a.total - b.total,
      "due-desc": (a, b) => due(b) - due(a),
    };
    return [...list].sort(sorters[sort]);
  }, [filtered, status, sort]);

  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = shown.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const live = shown.filter((o) => o.status !== "cancelled");
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const outstanding = live.reduce((s, o) => s + orderDue(o), 0);
  const toProcess = base.filter((o) => o.status === "pending" || o.status === "confirmed").length;

  const activeFilters = [q.trim(), method !== "all", pay !== "all", city !== "all", date !== "all"].filter(Boolean).length;
  const resetFilters = () => {
    setQ("");
    setMethod("all");
    setPay("all");
    setCity("all");
    setDate("all");
    setPage(1);
  };
  // Any filter change should land on page 1.
  const withReset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  const viewing = viewId ? db.orders.find((o) => o.id === viewId) ?? null : null;

  // Reservations per upcoming product, so stock can be ordered from the supplier before launch.
  const reservations = useMemo(() => {
    if (!preorders) return [];
    const active = base.filter((o) => o.status !== "cancelled" && o.status !== "delivered");
    return db.products
      .filter((p) => p.preOrder)
      .map((p) => {
        const lines = active.flatMap((o) => o.items.filter((l) => l.productId === p.id).map((l) => ({ l, o })));
        return {
          p,
          units: lines.reduce((s, x) => s + x.l.qty, 0),
          orders: new Set(lines.map((x) => x.o.id)).size,
          deposits: [...new Set(lines.map((x) => x.o))].reduce((s, o) => s + o.paid, 0),
        };
      })
      .sort((a, b) => b.units - a.units || a.p.preOrder!.releaseDate.localeCompare(b.p.preOrder!.releaseDate));
  }, [preorders, base, db.products]);

  return (
    <>
      <AdminHeader
        title={preorders ? "Pre-orders" : "Orders"}
        subtitle={
          preorders
            ? "Deposits received for upcoming launches. Deliver after launch to collect the balance."
            : "Online orders from the storefront and orders placed by staff"
        }
        actions={
          <Link
            href={preorders ? "/gadgets/admin/orders/new?type=preorder" : "/gadgets/admin/orders/new"}
            className={preorders ? `${btn.primary} bg-violet-600 hover:bg-violet-700` : btn.primary}
          >
            <Plus className="size-4" /> {preorders ? "New pre-order" : "New order"}
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Orders (filtered)" value={shown.length} hint={`of ${base.length} total`} icon={ShoppingCart} />
        <StatCard label="Order value" value={formatTaka(revenue)} hint="Excludes cancelled" icon={TrendingUp} tone="green" />
        <StatCard label="Outstanding due" value={formatTaka(outstanding)} hint="Still to collect" icon={Wallet} tone="rose" />
        <StatCard label="Needs action" value={toProcess} hint="Pending or confirmed" icon={Clock} tone="orange" />
      </div>

      {preorders && (
        <Card className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-neutral-900">
            <CalendarClock className="size-4 text-violet-600" /> Reservations by product
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {reservations.map(({ p, units, orders, deposits }) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-neutral-100 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-neutral-900">{p.name}</p>
                  <p className="text-xs text-neutral-500">
                    Launch {formatDate(p.preOrder!.releaseDate)} · {daysUntil(p.preOrder!.releaseDate)}d
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-600">
                    <b className="text-violet-700">{units} reserved</b> · {orders} orders · {formatTaka(deposits)} deposits
                  </p>
                </div>
                <Link href={`/gadgets/admin/products/${p.id}`} className="shrink-0 text-xs text-orange-600 hover:underline">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-neutral-100 px-3 [scrollbar-width:none]">
          {statuses.map((s) => {
            const count = s === "all" ? filtered.length : filtered.filter((o) => o.status === s).length;
            const selected = status === s;
            return (
              <button
                key={s}
                role="tab"
                aria-selected={selected}
                onClick={() => withReset(setStatus)(s)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-sm font-medium transition",
                  selected ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                {s !== "all" && <span className={cn("size-2 rounded-full", statusDot[s])} />}
                {s === "all" ? "All orders" : statusLabels[s]}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] tabular-nums",
                    selected ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  {count}
                </span>
                {selected && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-orange-500" />}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50/50 p-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={q}
              onChange={(e) => withReset(setQ)(e.target.value)}
              placeholder="Search ID, customer, phone, product"
              aria-label="Search orders"
              className="h-9 w-full rounded-full border border-neutral-200 bg-white pl-9 pr-8 text-sm outline-none transition placeholder:text-neutral-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {q && (
              <button
                onClick={() => withReset(setQ)("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <span className="mx-1 hidden h-5 w-px bg-neutral-200 sm:block" />

          <FilterMenu label="Date" icon={CalendarDays} value={date} defaultValue="all" options={dateOptions} onChange={withReset(setDate)} />
          <FilterMenu
            label="Method"
            icon={CreditCard}
            value={method}
            defaultValue="all"
            options={[{ value: "all", label: "All methods" }, ...methods.map((m) => ({ value: m, label: paymentLabels[m] }))]}
            onChange={withReset(setMethod)}
          />
          <FilterMenu
            label="Payment"
            icon={Wallet}
            value={pay}
            defaultValue="all"
            options={[
              { value: "all", label: "Any payment" },
              ...(["paid", "partial", "unpaid", "void"] as PaymentState[]).map((p) => ({
                value: p,
                label: paymentStateLabels[p],
                dot: paymentDot[p],
              })),
            ]}
            onChange={withReset(setPay)}
          />
          <FilterMenu
            label="City"
            icon={MapPin}
            value={city}
            defaultValue="all"
            options={[{ value: "all", label: "All cities" }, ...cities.map((c) => ({ value: c, label: c }))]}
            onChange={withReset(setCity)}
          />
          {activeFilters > 0 && (
            <button
              onClick={resetFilters}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-neutral-500 hover:bg-rose-50 hover:text-rose-600"
            >
              <FilterX className="size-4" /> Clear all
            </button>
          )}

          <div className="ml-auto">
            <FilterMenu label="Sort" icon={ArrowUpDown} value={sort} defaultValue="newest" options={sortOptions} onChange={setSort} />
          </div>
        </div>

        <Table className="rounded-none border-x-0 border-b-0">
          <thead className="bg-neutral-50">
            <tr>
              <th className={th}>Order</th>
              <th className={th}>Customer</th>
              <th className={th}>Items</th>
              <th className={th}>Payment</th>
              <th className={th}>Status</th>
              <th className={`${th} text-right`}>Total</th>
              <th className={`${th} text-right`}>Due</th>
              <th className={th}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((o) => {
              const due = o.status === "cancelled" ? 0 : orderDue(o);
              const units = o.items.reduce((s, l) => s + l.qty, 0);
              return (
                <tr
                  key={o.id}
                  onClick={() => setViewId(o.id)}
                  className={cn("cursor-pointer transition hover:bg-orange-50/40", viewId === o.id && "bg-orange-50/60")}
                >
                  <td className={td}>
                    <Link
                      href={`/gadgets/admin/orders/${o.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold text-neutral-900 hover:text-orange-600"
                    >
                      {o.id}
                    </Link>
                    <p className="mt-0.5 whitespace-nowrap text-xs text-neutral-500">
                      {preorders && o.releaseDate ? `Launch ${formatDate(o.releaseDate)}` : `${formatDate(o.createdAt)}, ${formatTime(o.createdAt)}`}
                    </p>
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">
                        {o.customer.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900">{o.customer.name}</p>
                        <p className="whitespace-nowrap text-xs text-neutral-500">
                          {o.customer.phone} · {o.customer.city}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-2">
                        {o.items.slice(0, 3).map((l, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={l.image} alt="" className="size-8 rounded-lg border-2 border-white bg-neutral-50 object-cover" />
                        ))}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 max-w-48 text-neutral-800">{o.items[0].name}</p>
                        <p className="text-xs text-neutral-500">
                          {units} {units === 1 ? "unit" : "units"}
                          {o.items.length > 1 && ` · ${o.items.length} products`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={td}>
                    <p className="whitespace-nowrap text-neutral-800">{paymentLabels[o.paymentMethod]}</p>
                    <PaymentBadge order={o} />
                  </td>
                  <td className={td}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className={`${td} text-right font-semibold tabular-nums text-neutral-900`}>{formatTaka(o.total)}</td>
                  <td className={cn(td, "text-right tabular-nums", due ? "font-medium text-rose-600" : "text-neutral-400")}>
                    {o.status === "cancelled" ? "—" : formatTaka(due)}
                  </td>
                  <td className={`${td} text-right`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewId(o.id);
                      }}
                      aria-label={`Quick view ${o.id}`}
                      className={btn.ghost}
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <p className="font-medium text-neutral-900">No orders match these filters</p>
                  {activeFilters > 0 && (
                    <button onClick={resetFilters} className="mt-2 text-sm font-medium text-orange-600 hover:underline">
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {shown.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-sm text-neutral-500">
            <p>
              Showing <b className="text-neutral-800">{(current - 1) * PAGE_SIZE + 1}</b>–
              <b className="text-neutral-800">{Math.min(current * PAGE_SIZE, shown.length)}</b> of{" "}
              <b className="text-neutral-800">{shown.length}</b>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(current - 1)}
                disabled={current === 1}
                aria-label="Previous page"
                className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 hover:border-orange-400 disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  aria-current={n === current ? "page" : undefined}
                  className={cn(
                    "size-8 rounded-lg text-xs font-medium",
                    n === current ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:border-orange-400"
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(current + 1)}
                disabled={current === pages}
                aria-label="Next page"
                className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 hover:border-orange-400 disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminOrderQuickView key={viewing?.id} order={viewing} onClose={() => setViewId(null)} />
    </>
  );
}
