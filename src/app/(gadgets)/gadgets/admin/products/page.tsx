"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteProduct, saveProduct, useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatTaka } from "@/src/lib/gadget-store/format";
import { AdminHeader, btn, Pills, SearchInput, Table, td, th } from "@/src/components/gadgets/admin/kit";

type StockFilter = "all" | "low" | "out" | "pre" | "hidden";

function ProductsInner() {
  const db = useGadgetDB();
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [stock, setStock] = useState<StockFilter>((params.get("stock") as StockFilter) ?? "all");

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return db.products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (stock === "low" && (p.preOrder || p.stock > 8)) return false;
      if (stock === "out" && (p.preOrder || p.stock > 0)) return false;
      if (stock === "pre" && !p.preOrder) return false;
      if (stock === "hidden" && p.active) return false;
      return !term || `${p.name} ${p.brand}`.toLowerCase().includes(term);
    });
  }, [db.products, q, cat, stock]);

  const stockValue = db.products.reduce((s, p) => s + p.cost * p.stock, 0);

  return (
    <>
      <AdminHeader
        title="Products"
        subtitle={`${db.products.length} products · stock value at cost ${formatTaka(stockValue)}`}
        actions={
          <Link href="/gadgets/admin/products/new" className={btn.primary}>
            <Plus className="size-4" /> Add product
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search products" />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Filter by category"
          className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm"
        >
          <option value="all">All categories</option>
          {db.categories.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
        <Pills<StockFilter>
          value={stock}
          onChange={setStock}
          options={[
            { value: "all", label: "All" },
            { value: "low", label: "Low stock" },
            { value: "out", label: "Out of stock" },
            { value: "pre", label: "Pre-order" },
            { value: "hidden", label: "Hidden" },
          ]}
        />
      </div>
      <Table>
        <thead className="bg-neutral-50">
          <tr>
            <th className={th}>Product</th>
            <th className={th}>Category</th>
            <th className={`${th} text-right`}>Cost</th>
            <th className={`${th} text-right`}>Price</th>
            <th className={`${th} text-right`}>Margin</th>
            <th className={`${th} text-right`}>Stock</th>
            <th className={th}>Visible</th>
            <th className={th} />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {shown.map((p) => (
            <tr key={p.id} className="hover:bg-neutral-50">
              <td className={td}>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" className="size-11 shrink-0 rounded-lg bg-neutral-100 object-cover" />
                  <div className="min-w-0">
                    <Link href={`/gadgets/admin/products/${p.id}`} className="line-clamp-1 font-medium text-neutral-900 hover:text-orange-600">
                      {p.name}
                    </Link>
                    <p className="text-xs text-neutral-500">{p.brand}</p>
                  </div>
                </div>
              </td>
              <td className={td}>{p.category}</td>
              <td className={`${td} text-right tabular-nums`}>{formatTaka(p.cost)}</td>
              <td className={`${td} text-right font-semibold tabular-nums`}>{formatTaka(p.price)}</td>
              <td className={`${td} text-right tabular-nums`}>{p.price ? `${(((p.price - p.cost) / p.price) * 100).toFixed(1)}%` : "—"}</td>
              <td className={`${td} text-right tabular-nums`}>
                {p.preOrder ? (
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">Pre-order</span>
                ) : (
                  <span className={p.stock === 0 ? "font-semibold text-rose-600" : p.stock <= 8 ? "font-semibold text-amber-600" : ""}>
                    {p.stock}
                  </span>
                )}
              </td>
              <td className={td}>
                <button
                  role="switch"
                  aria-checked={p.active}
                  aria-label={`Show ${p.name} in store`}
                  onClick={() => saveProduct({ ...p, active: !p.active }, p.id)}
                  className={`relative h-5 w-9 rounded-full transition ${p.active ? "bg-emerald-500" : "bg-neutral-300"}`}
                >
                  <span className={`absolute top-0.5 size-4 rounded-full bg-white transition ${p.active ? "left-4.5" : "left-0.5"}`} />
                </button>
              </td>
              <td className={`${td} whitespace-nowrap text-right`}>
                <Link href={`/gadgets/admin/products/${p.id}`} className={btn.ghost} aria-label={`Edit ${p.name}`}>
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
          ))}
          {shown.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-sm text-neutral-500">
                No products match.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense>
      <ProductsInner />
    </Suspense>
  );
}
