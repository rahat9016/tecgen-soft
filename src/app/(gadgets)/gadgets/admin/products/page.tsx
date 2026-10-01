"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpDown,
  Boxes,
  FilterX,
  FolderTree,
  Package,
  PackageX,
  Pencil,
  Plus,
  Tags,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  deleteProduct,
  saveProduct,
  useGadgetDB,
} from "@/src/lib/gadget-store/store";
import type { Product } from "@/src/lib/gadget-store/types";
import { formatDate, formatTaka } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import {
  AdminHeader,
  btn,
  FilterMenu,
  Pagination,
  SearchField,
  StatCard,
  Switch,
  Table,
  tableCardClass,
  TableTabs,
  td,
  th,
  toolbarClass,
  usePagination,
} from "@/src/components/gadgets/admin/kit";

type StockTab = "all" | "in" | "low" | "out" | "pre" | "hidden";
type SortKey =
  | "name"
  | "price-desc"
  | "price-asc"
  | "stock-asc"
  | "stock-desc"
  | "margin-desc";

const LOW_STOCK = 8;
const PAGE_SIZE = 12;

const tabTest: Record<StockTab, (p: Product) => boolean> = {
  all: () => true,
  in: (p) => !p.preOrder && p.stock > LOW_STOCK,
  low: (p) => !p.preOrder && p.stock > 0 && p.stock <= LOW_STOCK,
  out: (p) => !p.preOrder && p.stock === 0,
  pre: (p) => !!p.preOrder,
  hidden: (p) => !p.active,
};

const margin = (p: Product) =>
  p.price ? ((p.price - p.cost) / p.price) * 100 : 0;

const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  "price-desc": (a, b) => b.price - a.price,
  "price-asc": (a, b) => a.price - b.price,
  "stock-asc": (a, b) => a.stock - b.stock,
  "stock-desc": (a, b) => b.stock - a.stock,
  "margin-desc": (a, b) => margin(b) - margin(a),
};

const isTab = (v: string | null): v is StockTab => !!v && v in tabTest;

function ProductsInner() {
  const db = useGadgetDB();
  const params = useSearchParams();
  const initialTab = params.get("stock");
  const [tab, setTab] = useState<StockTab>(
    isTab(initialTab) ? initialTab : "all"
  );
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(params.get("category") ?? "all");
  const [brand, setBrand] = useState(params.get("brand") ?? "all");
  const [sort, setSort] = useState<SortKey>("name");

  // Everything except the stock tab, so tab counts reflect the other filters.
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return db.products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (brand === "all" || p.brand === brand) &&
        (!term ||
          `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term))
    );
  }, [db.products, q, cat, brand]);

  const shown = useMemo(
    () => [...filtered.filter(tabTest[tab])].sort(sorters[sort]),
    [filtered, tab, sort]
  );
  const paged = usePagination(shown, PAGE_SIZE);

  const stockValue = db.products.reduce((s, p) => s + p.cost * p.stock, 0);
  const lowCount = db.products.filter(tabTest.low).length;
  const outCount = db.products.filter(tabTest.out).length;

  const activeFilters = [q.trim(), cat !== "all", brand !== "all"].filter(
    Boolean
  ).length;
  const reset = () => {
    setQ("");
    setCat("all");
    setBrand("all");
  };
  const withReset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      paged.setPage(1);
    };

  const tabs: { value: StockTab; label: string; dot?: string }[] = [
    { value: "all", label: "All products" },
    { value: "in", label: "In stock", dot: "bg-emerald-500" },
    { value: "low", label: "Low stock", dot: "bg-amber-500" },
    { value: "out", label: "Out of stock", dot: "bg-rose-500" },
    { value: "pre", label: "Pre-order", dot: "bg-violet-500" },
    { value: "hidden", label: "Hidden", dot: "bg-neutral-400" },
  ];

  return (
    <>
      <AdminHeader
        title="Products"
        subtitle="Catalog, pricing and stock levels"
        actions={
          <Link href="/gadgets/admin/products/new" className={btn.primary}>
            <Plus className="size-4" /> Add product
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Products"
          value={db.products.length}
          hint={`${db.products.filter((p) => p.active).length} visible in store`}
          icon={Package}
        />
        <StatCard
          label="Stock value"
          value={formatTaka(stockValue)}
          hint="At cost price"
          icon={Wallet}
          tone="green"
        />
        <StatCard
          label="Low stock"
          value={lowCount}
          hint={`${LOW_STOCK} units or fewer`}
          icon={AlertTriangle}
          tone="orange"
        />
        <StatCard
          label="Out of stock"
          value={outCount}
          hint="Needs restocking"
          icon={PackageX}
          tone="rose"
        />
      </div>

      <div className={tableCardClass}>
        <TableTabs
          value={tab}
          onChange={withReset(setTab)}
          tabs={tabs.map((t) => ({
            ...t,
            count: filtered.filter(tabTest[t.value]).length,
          }))}
        />

        <div className={toolbarClass}>
          <SearchField
            value={q}
            onChange={withReset(setQ)}
            placeholder="Search name, brand, category"
          />
          <span className="mx-1 hidden h-5 w-px bg-neutral-200 sm:block" />
          <FilterMenu
            label="Category"
            icon={FolderTree}
            value={cat}
            defaultValue="all"
            options={[
              { value: "all", label: "All categories" },
              ...db.categories.map((c) => ({ value: c.name, label: c.name })),
            ]}
            onChange={withReset(setCat)}
          />
          <FilterMenu
            label="Brand"
            icon={Tags}
            value={brand}
            defaultValue="all"
            options={[
              { value: "all", label: "All brands" },
              ...db.brands.map((b) => ({ value: b.name, label: b.name })),
            ]}
            onChange={withReset(setBrand)}
          />
          {activeFilters > 0 && (
            <button
              onClick={reset}
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
              defaultValue="name"
              options={[
                { value: "name", label: "Name A–Z" },
                { value: "price-desc", label: "Price: high to low" },
                { value: "price-asc", label: "Price: low to high" },
                { value: "stock-asc", label: "Stock: low to high" },
                { value: "stock-desc", label: "Stock: high to low" },
                { value: "margin-desc", label: "Margin: highest" },
              ]}
              onChange={setSort}
            />
          </div>
        </div>

        <Table className="rounded-none border-0">
          <thead className="bg-neutral-50">
            <tr>
              <th className={th}>Product</th>
              <th className={th}>Category</th>
              <th className={`${th} text-right`}>Price</th>
              <th className={`${th} text-right`}>Margin</th>
              <th className={th}>Stock</th>
              <th className={th}>Visible</th>
              <th className={th}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paged.rows.map((p) => {
              const m = margin(p);
              return (
                <tr
                  key={p.id}
                  className={cn(
                    "transition hover:bg-orange-50/30",
                    !p.active && "bg-neutral-50/70"
                  )}
                >
                  <td className={td}>
                    <div className="flex min-w-56 items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt=""
                        className={cn(
                          "size-12 shrink-0 rounded-xl border border-neutral-100 bg-neutral-50 object-cover",
                          !p.active && "opacity-50"
                        )}
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/gadgets/admin/products/${p.id}`}
                          className="line-clamp-1 max-w-64 font-medium text-neutral-900 hover:text-orange-600"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-neutral-500">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className={td}>
                    <span className="whitespace-nowrap rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                      {p.category}
                    </span>
                  </td>
                  <td className={`${td} text-right`}>
                    <p className="font-semibold tabular-nums text-neutral-900">
                      {formatTaka(p.price)}
                    </p>
                    <p className="text-xs tabular-nums text-neutral-400">
                      cost {formatTaka(p.cost)}
                    </p>
                  </td>
                  <td className={`${td} text-right`}>
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                        m >= 12
                          ? "bg-emerald-50 text-emerald-700"
                          : m >= 6
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      )}
                    >
                      {p.price ? `${m.toFixed(1)}%` : "—"}
                    </span>
                  </td>
                  <td className={td}>
                    {p.preOrder ? (
                      <div>
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                          Pre-order
                        </span>
                        <p className="mt-1 whitespace-nowrap text-[11px] text-neutral-500">
                          Launch {formatDate(p.preOrder.releaseDate)}
                        </p>
                      </div>
                    ) : (
                      <StockLevel stock={p.stock} />
                    )}
                  </td>
                  <td className={td}>
                    <Switch
                      checked={p.active}
                      label={`Show ${p.name} in store`}
                      onChange={() => {
                        saveProduct({ ...p, active: !p.active }, p.id);
                        toast.success(
                          `${p.name} ${p.active ? "hidden from" : "shown in"} store`
                        );
                      }}
                    />
                  </td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <Link
                      href={`/gadgets/admin/products/${p.id}`}
                      className={btn.ghost}
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <button
                      className={btn.ghostDanger}
                      aria-label={`Delete ${p.name}`}
                      onClick={() => {
                        if (confirm(`Delete ${p.name}?`)) {
                          deleteProduct(p.id);
                          toast.success("Product deleted");
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {paged.rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <Boxes className="mx-auto size-8 text-neutral-300" />
                  <p className="mt-2 font-medium text-neutral-900">
                    No products match
                  </p>
                  {activeFilters > 0 && (
                    <button
                      onClick={reset}
                      className="mt-1 text-sm font-medium text-orange-600 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <Pagination {...paged} noun="products" />
      </div>
    </>
  );
}

function StockLevel({ stock }: { stock: number }) {
  const tone = stock === 0 ? "rose" : stock <= LOW_STOCK ? "amber" : "emerald";
  const pct = Math.min(100, (stock / 30) * 100);
  return (
    <div className="w-28">
      <p
        className={cn(
          "text-sm font-semibold tabular-nums",
          tone === "rose"
            ? "text-rose-600"
            : tone === "amber"
              ? "text-amber-600"
              : "text-neutral-900"
        )}
      >
        {stock === 0 ? "Out of stock" : `${stock} units`}
      </p>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "rose"
              ? "bg-rose-500"
              : tone === "amber"
                ? "bg-amber-500"
                : "bg-emerald-500"
          )}
          style={{ width: `${Math.max(stock ? 6 : 0, pct)}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense>
      <ProductsInner />
    </Suspense>
  );
}
