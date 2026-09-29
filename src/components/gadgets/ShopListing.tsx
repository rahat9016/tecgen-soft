"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { useGadgetDB } from "@/src/lib/gadget-store/store";
import { cn } from "@/src/lib/utils";
import GadgetCard from "./GadgetCard";
import { EmptyState } from "./shared";

const sorts = [
  { value: "popular", label: "Popular" },
  { value: "discount", label: "Biggest discount" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "new", label: "Newest" },
];

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export default function ShopListing() {
  const { products, categories, brands } = useGadgetDB();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const selCats = list(params.get("category"));
  const selBrands = list(params.get("brand"));
  const sort = params.get("sort") ?? "popular";
  const stock = params.get("stock") ?? "all";

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const toggle = (key: "category" | "brand", current: string[], value: string) => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParam(key, next.length ? next.join(",") : null);
  };

  const results = useMemo(() => {
    let r = products.filter((p) => p.active);
    if (selCats.length) r = r.filter((p) => selCats.includes(p.category));
    if (selBrands.length) r = r.filter((p) => selBrands.includes(p.brand));
    if (stock === "in") r = r.filter((p) => !p.preOrder && p.stock > 0);
    if (stock === "pre") r = r.filter((p) => p.preOrder);
    const disc = (p: (typeof r)[number]) => (p.originalPrice ? (p.originalPrice - p.price) / p.originalPrice : 0);
    const sorted = [...r];
    if (sort === "discount") sorted.sort((a, b) => disc(b) - disc(a));
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "new") sorted.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    if (sort === "popular") sorted.sort((a, b) => (b.tags?.length ?? 0) - (a.tags?.length ?? 0));
    return sorted;
  }, [products, selCats, selBrands, sort, stock]);

  const title =
    selCats.length === 1 && !selBrands.length
      ? selCats[0]
      : selBrands.length === 1 && !selCats.length
        ? `${selBrands[0]} Products`
        : sort === "discount"
          ? "Offers & Deals"
          : "All Gadgets";

  const usedBrands = brands.filter((b) => products.some((p) => p.brand === b.name));

  const filters = (
    <div className="space-y-7">
      <FilterGroup title="Availability">
        {[
          ["all", "All products"],
          ["in", "In stock"],
          ["pre", "Pre-order"],
        ].map(([v, l]) => (
          <label key={v} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <input
              type="radio"
              name="stock"
              checked={stock === v}
              onChange={() => setParam("stock", v === "all" ? null : v)}
              className="accent-orange-500"
            />
            {l}
          </label>
        ))}
      </FilterGroup>
      <FilterGroup title="Category">
        {categories.map((c) => (
          <label key={c.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={selCats.includes(c.name)}
              onChange={() => toggle("category", selCats, c.name)}
              className="size-4 accent-orange-500"
            />
            {c.name}
            <span className="ml-auto text-xs text-neutral-400">
              {products.filter((p) => p.active && p.category === c.name).length}
            </span>
          </label>
        ))}
      </FilterGroup>
      <FilterGroup title="Brand">
        {usedBrands.map((b) => (
          <label key={b.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={selBrands.includes(b.name)}
              onChange={() => toggle("brand", selBrands, b.name)}
              className="size-4 accent-orange-500"
            />
            {b.name}
          </label>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="container mt-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-neutral-500">
        <Link href="/gadgets" className="hover:text-orange-500">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-neutral-800">{title}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-neutral-500">{results.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm lg:hidden"
          >
            <SlidersHorizontal className="size-4" /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value === "popular" ? null : e.target.value)}
            aria-label="Sort products"
            className="h-10 rounded-full border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-orange-400"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(selCats.length > 0 || selBrands.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {[...selCats.map((v) => ["category", v] as const), ...selBrands.map((v) => ["brand", v] as const)].map(
            ([k, v]) => (
              <button
                key={k + v}
                onClick={() => toggle(k, k === "category" ? selCats : selBrands, v)}
                className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
              >
                {v} <X className="size-3" />
              </button>
            )
          )}
          <button onClick={() => router.replace(pathname)} className="px-2 text-xs text-neutral-500 hover:underline">
            Clear all
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>
        <div>
          {results.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {results.map((p) => (
                <GadgetCard key={p.id} item={p} />
              ))}
            </div>
          ) : (
            <EmptyState icon={PackageSearch} title="No products match" text="Try removing a filter." />
          )}
        </div>
      </div>

      <div className={cn("fixed inset-0 z-50 lg:hidden", filtersOpen ? "" : "hidden")}>
        <button aria-label="Close filters" className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
        <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              <X className="size-5" />
            </button>
          </div>
          {filters}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-neutral-900">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}
