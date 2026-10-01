"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Check,
  FolderTree,
  Package,
  Pencil,
  Plus,
  Tags,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  deleteNamed,
  saveNamed,
  useGadgetDB,
} from "@/src/lib/gadget-store/store";
import { formatTaka } from "@/src/lib/gadget-store/format";
import { cn } from "@/src/lib/utils";
import {
  AdminHeader,
  btn,
  FilterMenu,
  Pagination,
  SearchField,
  StatCard,
  Table,
  tableCardClass,
  td,
  th,
  toolbarClass,
  usePagination,
} from "./kit";

type SortKey = "name" | "products" | "units" | "value";

/** CRUD table for categories or brands, with product counts and stock value. */
export default function NamedList({ kind }: { kind: "categories" | "brands" }) {
  const db = useGadgetDB();
  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("value");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(
    null
  );

  const isCat = kind === "categories";
  const field = isCat ? "category" : "brand";
  const noun = isCat ? "category" : "brand";
  const Icon = isCat ? FolderTree : Tags;

  const rows = useMemo(() => {
    return db[kind].map((x) => {
      const products = db.products.filter((p) => p[field] === x.name);
      return {
        x,
        products: products.length,
        units: products.reduce((s, p) => s + p.stock, 0),
        value: products.reduce((s, p) => s + p.stock * p.cost, 0),
        images: products.slice(0, 3).map((p) => p.image),
      };
    });
  }, [db, kind, field]);

  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const empty = rows.filter((r) => r.products === 0).length;

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const sorters: Record<
      SortKey,
      (a: (typeof rows)[number], b: (typeof rows)[number]) => number
    > = {
      name: (a, b) => a.x.name.localeCompare(b.x.name),
      products: (a, b) => b.products - a.products,
      units: (a, b) => b.units - a.units,
      value: (a, b) => b.value - a.value,
    };
    return rows
      .filter((r) => !term || r.x.name.toLowerCase().includes(term))
      .sort(sorters[sort]);
  }, [rows, q, sort]);
  const paged = usePagination(shown, 15);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (db[kind].some((x) => x.name.toLowerCase() === n.toLowerCase()))
      return toast.error(`That ${noun} already exists`);
    saveNamed(kind, n);
    setName("");
    toast.success(`${n} added`);
  };

  const rename = (id: string, current: string) => {
    if (!editing) return;
    const n = editing.name.trim();
    if (n && n !== current) {
      if (
        db[kind].some(
          (x) => x.id !== id && x.name.toLowerCase() === n.toLowerCase()
        )
      )
        return toast.error(`That ${noun} already exists`);
      saveNamed(kind, n, id);
      toast.success(`Renamed to ${n}`);
    }
    setEditing(null);
  };

  return (
    <>
      <AdminHeader
        title={isCat ? "Categories" : "Brands"}
        subtitle={
          isCat
            ? "Group products for the store menu and filters"
            : "Manufacturers carried in the store"
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label={isCat ? "Categories" : "Brands"}
          value={rows.length}
          icon={Icon}
        />
        <StatCard
          label="Products"
          value={db.products.length}
          hint={`Across all ${kind}`}
          icon={Package}
          tone="violet"
        />
        <StatCard
          label="Stock value"
          value={formatTaka(totalValue)}
          hint="At cost price"
          icon={Wallet}
          tone="green"
        />
        <StatCard
          label={`Empty ${kind}`}
          value={empty}
          hint="No products yet"
          icon={Icon}
          tone={empty ? "orange" : "neutral"}
        />
      </div>

      <div className={tableCardClass}>
        <div className={toolbarClass}>
          <SearchField
            value={q}
            onChange={(v) => {
              setQ(v);
              paged.setPage(1);
            }}
            placeholder={`Search ${kind}`}
          />
          <FilterMenu
            label="Sort"
            icon={ArrowUpDown}
            value={sort}
            defaultValue="value"
            options={[
              { value: "value", label: "Stock value" },
              { value: "products", label: "Most products" },
              { value: "units", label: "Most units" },
              { value: "name", label: "Name A–Z" },
            ]}
            onChange={setSort}
          />
          <form
            onSubmit={add}
            className="flex w-full gap-2 sm:ml-auto sm:w-auto"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`New ${noun} name`}
              aria-label={`New ${noun} name`}
              className="h-9 min-w-0 flex-1 rounded-full border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-56"
            />
            <button
              disabled={!name.trim()}
              className={cn(btn.primary, "h-9 rounded-full")}
            >
              <Plus className="size-4" /> Add
            </button>
          </form>
        </div>

        <Table className="rounded-none border-0">
          <thead className="bg-neutral-50">
            <tr>
              <th className={th}>Name</th>
              <th className={`${th} text-right`}>Products</th>
              <th className={`${th} text-right`}>Units in stock</th>
              <th className={th}>Stock value</th>
              <th className={th}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paged.rows.map(({ x, products, units, value, images }) => {
              const isEditing = editing?.id === x.id;
              const share = totalValue ? (value / totalValue) * 100 : 0;
              return (
                <tr key={x.id} className="transition hover:bg-orange-50/30">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-sm font-bold text-neutral-600">
                        {isCat ? <Icon className="size-4.5" /> : x.name[0]}
                      </span>
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editing.name}
                          onChange={(e) =>
                            setEditing({ ...editing, name: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") rename(x.id, x.name);
                            if (e.key === "Escape") setEditing(null);
                          }}
                          aria-label={`Rename ${x.name}`}
                          className="h-9 w-full max-w-60 rounded-lg border border-orange-300 px-2.5 text-sm outline-none ring-2 ring-orange-100"
                        />
                      ) : (
                        <div className="min-w-0">
                          <Link
                            href={`/gadgets/admin/products?${field}=${encodeURIComponent(x.name)}`}
                            className="font-medium text-neutral-900 hover:text-orange-600"
                          >
                            {x.name}
                          </Link>
                          {products > 0 && (
                            <div className="mt-1 flex -space-x-1.5">
                              {images.map((src, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  key={i}
                                  src={src}
                                  alt=""
                                  className="size-5 rounded-md border border-white bg-neutral-50 object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={`${td} text-right tabular-nums`}>
                    {products ? (
                      products
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                        Empty
                      </span>
                    )}
                  </td>
                  <td className={`${td} text-right tabular-nums`}>{units}</td>
                  <td className={td}>
                    <div className="w-40">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold tabular-nums text-neutral-900">
                          {formatTaka(value)}
                        </span>
                        <span className="text-[11px] tabular-nums text-neutral-400">
                          {share.toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-orange-500"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    {isEditing ? (
                      <>
                        <button
                          className={btn.ghost}
                          aria-label="Save"
                          onClick={() => rename(x.id, x.name)}
                        >
                          <Check className="size-4 text-emerald-600" />
                        </button>
                        <button
                          className={btn.ghost}
                          aria-label="Cancel"
                          onClick={() => setEditing(null)}
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={btn.ghost}
                          aria-label={`Rename ${x.name}`}
                          onClick={() => setEditing({ id: x.id, name: x.name })}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          className={btn.ghostDanger}
                          aria-label={`Delete ${x.name}`}
                          onClick={() => {
                            if (products)
                              return toast.error(
                                `Move or delete its ${products} products first`
                              );
                            if (confirm(`Delete ${x.name}?`)) {
                              deleteNamed(kind, x.id);
                              toast.success(`${x.name} deleted`);
                            }
                          }}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {paged.rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-14 text-center text-sm text-neutral-500"
                >
                  {q
                    ? `No ${kind} match “${q.trim()}”.`
                    : `No ${kind} yet — add one above.`}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <Pagination {...paged} noun={kind} />
      </div>
    </>
  );
}
