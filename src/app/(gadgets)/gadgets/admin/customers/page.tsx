"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  CalendarClock,
  FilterX,
  MapPin,
  MessageSquare,
  Repeat,
  ShoppingCart,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { orderDue, useGadgetDB } from "@/src/lib/gadget-store/store";
import type { Customer } from "@/src/lib/gadget-store/types";
import { formatDate, formatTaka } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import GadgetAvatar from "@/src/components/gadgets/GadgetAvatar";
import {
  AdminHeader,
  btn,
  FilterMenu,
  Pagination,
  SearchField,
  StatCard,
  Table,
  tableCardClass,
  TableTabs,
  td,
  th,
  toolbarClass,
  usePagination,
} from "@/src/components/gadgets/admin/kit";

type Segment = "all" | "repeat" | "due" | "none";
type SortKey = "spent" | "orders" | "recent" | "due" | "newest" | "name";
type Row = {
  c: Customer;
  count: number;
  spent: number;
  due: number;
  last?: string;
};

const segments: Record<Segment, (r: Row) => boolean> = {
  all: () => true,
  repeat: (r) => r.count >= 2,
  due: (r) => r.due > 0,
  none: (r) => r.count === 0,
};

const sorters: Record<SortKey, (a: Row, b: Row) => number> = {
  spent: (a, b) => b.spent - a.spent,
  orders: (a, b) => b.count - a.count,
  recent: (a, b) => (b.last ?? "").localeCompare(a.last ?? ""),
  due: (a, b) => b.due - a.due,
  newest: (a, b) => b.c.joinedAt.localeCompare(a.c.joinedAt),
  name: (a, b) => a.c.name.localeCompare(b.c.name),
};

export default function CustomersPage() {
  const db = useGadgetDB();
  const [q, setQ] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<SortKey>("spent");

  const all = useMemo<Row[]>(
    () =>
      db.customers.map((c) => {
        const orders = db.orders.filter(
          (o) => o.customerId === c.id && o.status !== "cancelled"
        );
        return {
          c,
          count: orders.length,
          spent: orders.reduce((s, o) => s + o.paid, 0),
          due: orders.reduce((s, o) => s + orderDue(o), 0),
          last: orders.reduce<string | undefined>(
            (m, o) => (!m || o.createdAt > m ? o.createdAt : m),
            undefined
          ),
        };
      }),
    [db.customers, db.orders]
  );
  const cities = useMemo(
    () => [...new Set(db.customers.map((c) => c.city))].sort(),
    [db.customers]
  );
  // All filters except the segment tab, so tab counts reflect search and city.
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const digits = term.replace(/\D/g, "");
    return all.filter(
      ({ c }) =>
        (city === "all" || c.city === city) &&
        (!term ||
          `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(term) ||
          (digits.length >= 3 && c.phone.replace(/\D/g, "").includes(digits)))
    );
  }, [all, q, city]);

  const shown = useMemo(
    () => filtered.filter(segments[segment]).sort(sorters[sort]),
    [filtered, segment, sort]
  );
  const paged = usePagination(shown, 12);

  const totalPaid = all.reduce((s, r) => s + r.spent, 0);
  const totalDue = all.reduce((s, r) => s + r.due, 0);
  const repeatCount = all.filter(segments.repeat).length;

  const activeFilters = [q.trim(), city !== "all"].filter(Boolean).length;
  const withReset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      paged.setPage(1);
    };

  return (
    <>
      <AdminHeader
        title="Customers"
        subtitle="Everyone who has ordered online or been added by staff"
        actions={
          <Link href="/gadgets/admin/orders/new" className={btn.primary}>
            <UserPlus className="size-4" /> Order for new customer
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Customers"
          value={all.length}
          hint={`${all.filter((r) => r.count > 0).length} have ordered`}
          icon={Users}
        />
        <StatCard
          label="Repeat buyers"
          value={repeatCount}
          hint={
            all.length
              ? `${Math.round((repeatCount / all.length) * 100)}% of customers`
              : undefined
          }
          icon={Repeat}
          tone="violet"
        />
        <StatCard
          label="Total paid"
          value={formatTaka(totalPaid)}
          hint="Excludes cancelled orders"
          icon={Wallet}
          tone="green"
        />
        <StatCard
          label="Outstanding due"
          value={formatTaka(totalDue)}
          hint="Across all customers"
          icon={Wallet}
          tone="rose"
        />
      </div>

      <div className={tableCardClass}>
        <TableTabs
          value={segment}
          onChange={withReset(setSegment)}
          tabs={(
            [
              { value: "all", label: "All customers" },
              { value: "repeat", label: "Repeat buyers", dot: "bg-violet-500" },
              { value: "due", label: "Has due", dot: "bg-rose-500" },
              { value: "none", label: "No orders", dot: "bg-neutral-400" },
            ] as { value: Segment; label: string; dot?: string }[]
          ).map((t) => ({
            ...t,
            count: filtered.filter(segments[t.value]).length,
          }))}
        />

        <div className={toolbarClass}>
          <SearchField
            value={q}
            onChange={withReset(setQ)}
            placeholder="Search name, phone, email"
          />
          <span className="mx-1 hidden h-5 w-px bg-neutral-200 sm:block" />
          <FilterMenu
            label="City"
            icon={MapPin}
            value={city}
            defaultValue="all"
            options={[
              { value: "all", label: "All cities" },
              ...cities.map((c) => ({ value: c, label: c })),
            ]}
            onChange={withReset(setCity)}
          />
          {activeFilters > 0 && (
            <button
              onClick={() => {
                setQ("");
                setCity("all");
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-neutral-500 hover:bg-rose-50 hover:text-rose-600"
            >
              <FilterX className="size-4" /> Clear all
            </button>
          )}
          <div className="ml-auto">
            <FilterMenu
              label="Sort"
              icon={ArrowUpDown}
              value={sort}
              defaultValue="spent"
              options={[
                { value: "spent", label: "Top spenders" },
                { value: "orders", label: "Most orders" },
                { value: "recent", label: "Recent order" },
                { value: "due", label: "Highest due" },
                { value: "newest", label: "Newest customers" },
                { value: "name", label: "Name A–Z" },
              ]}
              onChange={setSort}
            />
          </div>
        </div>

        <Table className="rounded-none border-0">
          <thead className="bg-neutral-50">
            <tr>
              <th className={th}>Customer</th>
              <th className={th}>Location</th>
              <th className={`${th} text-right`}>Orders</th>
              <th className={`${th} text-right`}>Paid</th>
              <th className={`${th} text-right`}>Due</th>
              <th className={th}>Last order</th>
              <th className={th}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paged.rows.map(({ c, count, spent, due, last }) => (
              <tr key={c.id} className="transition hover:bg-orange-50/30">
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <GadgetAvatar
                      user={c}
                      className="size-10 shrink-0 bg-neutral-900 text-sm font-semibold text-white"
                    />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-medium text-neutral-900">
                        {c.name}
                        {count >= 2 && (
                          <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                            Repeat
                          </span>
                        )}
                      </p>
                      <p className="whitespace-nowrap text-xs text-neutral-500">
                        <a
                          href={`tel:${c.phone}`}
                          className="hover:text-orange-600"
                        >
                          {c.phone}
                        </a>
                        {c.email && <> · {c.email}</>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={td}>
                  <p className="font-medium text-neutral-800">{c.city}</p>
                  <p className="text-xs text-neutral-500">
                    Joined {formatDate(c.joinedAt)}
                  </p>
                </td>
                <td className={`${td} text-right tabular-nums`}>
                  {count ? (
                    <span className="font-medium text-neutral-900">
                      {count}
                    </span>
                  ) : (
                    <span className="text-neutral-400">0</span>
                  )}
                </td>
                <td
                  className={`${td} text-right font-semibold tabular-nums text-neutral-900`}
                >
                  {formatTaka(spent)}
                </td>
                <td
                  className={cn(
                    td,
                    "text-right tabular-nums",
                    due ? "font-medium text-rose-600" : "text-neutral-400"
                  )}
                >
                  {formatTaka(due)}
                </td>
                <td className={`${td} whitespace-nowrap`}>
                  {last ? (
                    formatDate(last)
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
                <td className={`${td} whitespace-nowrap text-right`}>
                  <Link
                    href={`/gadgets/admin/orders/new?c=${c.id}`}
                    className={btn.ghost}
                    aria-label={`New order for ${c.name}`}
                    title="New order"
                  >
                    <ShoppingCart className="size-4" />
                  </Link>
                  <Link
                    href={`/gadgets/admin/orders/new?type=preorder&c=${c.id}`}
                    className={btn.ghost}
                    aria-label={`New pre-order for ${c.name}`}
                    title="New pre-order"
                  >
                    <CalendarClock className="size-4" />
                  </Link>
                  <Link
                    href={`/gadgets/admin/chat?c=${c.id}`}
                    className={btn.ghost}
                    aria-label={`Chat with ${c.name}`}
                    title="Chat"
                  >
                    <MessageSquare className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {paged.rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <Users className="mx-auto size-8 text-neutral-300" />
                  <p className="mt-2 font-medium text-neutral-900">
                    No customers match
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <Pagination {...paged} noun="customers" />
      </div>
    </>
  );
}
