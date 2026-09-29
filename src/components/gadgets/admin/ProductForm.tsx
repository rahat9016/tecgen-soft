"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { saveProduct, slugify, useGadgetDB } from "@/src/lib/gadget-store/store";
import type { Product } from "@/src/lib/gadget-store/types";
import { formatTaka } from "@/src/lib/gadget-store/format";
import { Field, inputClass } from "../shared";
import { btn, Card } from "./kit";

/** Downscale an uploaded photo to ≤800px WebP so it fits comfortably in localStorage. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 800 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/webp", 0.82));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const csv = (v?: string[]) => (v ?? []).join(", ");
const fromCsv = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default function ProductForm({ productId }: { productId?: string }) {
  const db = useGadgetDB();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const existing = productId ? db.products.find((p) => p.id === productId) : undefined;

  const [f, setF] = useState(() => ({
    name: existing?.name ?? "",
    slug: existing?.slug ?? "",
    brand: existing?.brand ?? db.brands[0]?.name ?? "",
    category: existing?.category ?? db.categories[0]?.name ?? "",
    image: existing?.image ?? "",
    price: String(existing?.price ?? ""),
    originalPrice: String(existing?.originalPrice ?? ""),
    cost: String(existing?.cost ?? ""),
    stock: String(existing?.stock ?? 10),
    description: existing?.description ?? "",
    colors: csv(existing?.colors),
    storage: csv(existing?.storage),
    isNew: existing?.isNew ?? false,
    active: existing?.active ?? true,
    tags: existing?.tags ?? [],
    preOrder: !!existing?.preOrder,
    releaseDate: existing?.preOrder?.releaseDate ?? "",
    deposit: String(existing?.preOrder?.deposit ?? ""),
  }));
  const [specs, setSpecs] = useState(existing?.specs ?? [{ label: "Warranty", value: "1 Year Official Warranty" }]);

  if (productId && !existing) {
    return <p className="text-sm text-neutral-500">Product not found.</p>;
  }

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    try {
      const data = await compressImage(file);
      setF((s) => ({ ...s, image: data }));
    } catch {
      toast.error("Could not read that image");
    }
  };

  const price = Number(f.price) || 0;
  const cost = Number(f.cost) || 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.image) return toast.error("Upload a product image");
    if (f.preOrder && (!f.releaseDate || !Number(f.deposit))) return toast.error("Set launch date and deposit for pre-order");
    const data: Omit<Product, "id" | "slug"> & { slug?: string } = {
      name: f.name.trim(),
      slug: f.slug ? slugify(f.slug) : existing?.slug,
      brand: f.brand,
      category: f.category,
      image: f.image,
      price,
      originalPrice: Number(f.originalPrice) > price ? Number(f.originalPrice) : null,
      cost: cost || Math.round(price * 0.86),
      stock: f.preOrder ? 0 : Math.max(0, Math.round(Number(f.stock) || 0)),
      description: f.description.trim() || undefined,
      colors: fromCsv(f.colors).length ? fromCsv(f.colors) : undefined,
      storage: fromCsv(f.storage).length ? fromCsv(f.storage) : undefined,
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      isNew: f.isNew,
      active: f.active,
      tags: f.tags,
      preOrder: f.preOrder ? { releaseDate: f.releaseDate, deposit: Number(f.deposit) } : null,
    };
    saveProduct(data, existing?.id);
    toast.success(existing ? "Product updated" : "Product added");
    router.push("/gadgets/admin/products");
  };

  const toggleTag = (t: NonNullable<Product["tags"]>[number]) =>
    setF((s) => ({ ...s, tags: s.tags.includes(t) ? s.tags.filter((x) => x !== t) : [...s.tags, t] }));

  return (
    <form onSubmit={submit}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/gadgets/admin/products" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-orange-600">
            <ArrowLeft className="size-4" /> Products
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">{existing ? "Edit product" : "Add product"}</h1>
        </div>
        <div className="flex gap-2">
          {existing && (
            <Link href={`/gadgets/product/${existing.slug}`} target="_blank" className={btn.outline}>
              View in store
            </Link>
          )}
          <button className={btn.primary}>{existing ? "Save changes" : "Publish product"}</button>
        </div>
      </div>

      <div className="grid gap-6 [&>*]:min-w-0 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-semibold text-neutral-900">Basic info</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" className="sm:col-span-2">
                <input required value={f.name} onChange={set("name")} className={inputClass} placeholder="e.g. iPhone 17 Pro 256GB" />
              </Field>
              <Field label="Brand">
                <select value={f.brand} onChange={set("brand")} className={inputClass}>
                  {db.brands.map((b) => (
                    <option key={b.id}>{b.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <select value={f.category} onChange={set("category")} className={inputClass}>
                  {db.categories.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="URL slug (optional)" className="sm:col-span-2">
                <input value={f.slug} onChange={set("slug")} className={inputClass} placeholder={slugify(f.name) || "auto-generated"} />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea rows={4} value={f.description} onChange={set("description")} className={`${inputClass} h-auto py-2.5`} />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold text-neutral-900">Pricing & stock</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Selling price (৳)">
                <input required type="number" min={1} value={f.price} onChange={set("price")} className={inputClass} />
              </Field>
              <Field label="Regular price (৳)">
                <input type="number" min={0} value={f.originalPrice} onChange={set("originalPrice")} className={inputClass} placeholder="for strike-through" />
              </Field>
              <Field label="Cost price (৳)">
                <input type="number" min={0} value={f.cost} onChange={set("cost")} className={inputClass} />
              </Field>
              <Field label="Stock qty">
                <input type="number" min={0} value={f.stock} onChange={set("stock")} disabled={f.preOrder} className={`${inputClass} disabled:bg-neutral-100`} />
              </Field>
            </div>
            {price > 0 && cost > 0 && (
              <p className="mt-3 text-sm text-neutral-500">
                Profit per unit <b className="text-neutral-900">{formatTaka(price - cost)}</b> · margin{" "}
                <b className="text-neutral-900">{(((price - cost) / price) * 100).toFixed(1)}%</b>
              </p>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold text-neutral-900">Variants & specifications</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Colors (comma separated)">
                <input value={f.colors} onChange={set("colors")} className={inputClass} placeholder="Black, Silver, Blue" />
              </Field>
              <Field label="Storage options (comma separated)">
                <input value={f.storage} onChange={set("storage")} className={inputClass} placeholder="128GB, 256GB" />
              </Field>
            </div>
            <div className="mt-5 space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={s.label}
                    onChange={(e) => setSpecs((arr) => arr.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    placeholder="Spec (e.g. Display)"
                    aria-label="Spec name"
                    className={`${inputClass} w-44`}
                  />
                  <input
                    value={s.value}
                    onChange={(e) => setSpecs((arr) => arr.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                    placeholder="Value"
                    aria-label="Spec value"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => setSpecs((arr) => arr.filter((_, j) => j !== i))} className={btn.ghostDanger} aria-label="Remove spec">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setSpecs((arr) => [...arr, { label: "", value: "" }])} className={btn.outline}>
                <Plus className="size-4" /> Add spec
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-semibold text-neutral-900">Product image</h2>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFile(e.dataTransfer.files[0]);
              }}
              className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 hover:border-orange-400"
            >
              {f.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.image} alt="Product preview" className="size-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm text-neutral-500">
                  <ImagePlus className="size-8 text-neutral-400" />
                  Click or drop an image
                </span>
              )}
              {f.image && (
                <span className="absolute inset-x-0 bottom-0 bg-black/60 py-2 text-xs text-white opacity-0 transition group-hover:opacity-100">
                  Change image
                </span>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold text-neutral-900">Visibility</h2>
            <div className="space-y-3 text-sm">
              <Check label="Show in store" checked={f.active} onChange={(v) => setF((s) => ({ ...s, active: v }))} />
              <Check label="Mark as New Arrival" checked={f.isNew} onChange={(v) => setF((s) => ({ ...s, isNew: v }))} />
              <p className="pt-2 text-xs font-medium text-neutral-500">Home page sections</p>
              {(
                [
                  ["apple", "Apple Exclusive"],
                  ["deal", "Exclusive Deals"],
                  ["best", "Best Deals"],
                  ["top", "Top Selling"],
                ] as const
              ).map(([t, l]) => (
                <Check key={t} label={l} checked={f.tags.includes(t)} onChange={() => toggleTag(t)} />
              ))}
            </div>
          </Card>

          <Card className={f.preOrder ? "border-violet-300" : ""}>
            <Check label="Open for pre-order" checked={f.preOrder} onChange={(v) => setF((s) => ({ ...s, preOrder: v }))} bold />
            {f.preOrder && (
              <div className="mt-4 grid gap-3">
                <Field label="Expected launch date">
                  <input type="date" value={f.releaseDate} onChange={set("releaseDate")} className={inputClass} />
                </Field>
                <Field label="Deposit (৳)">
                  <input type="number" min={1} value={f.deposit} onChange={set("deposit")} className={inputClass} />
                </Field>
              </div>
            )}
          </Card>
        </div>
      </div>
    </form>
  );
}

function Check({ label, checked, onChange, bold }: { label: string; checked: boolean; onChange: (v: boolean) => void; bold?: boolean }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 ${bold ? "font-semibold text-neutral-900" : "text-neutral-700"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-orange-500" />
      {label}
    </label>
  );
}
