"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { deleteNamed, saveNamed, useGadgetDB } from "@/src/lib/gadget-store/store";
import { formatTaka } from "@/src/lib/gadget-store/format";
import { AdminHeader, btn, Table, td, th } from "./kit";

/** CRUD table for categories or brands, with product counts and stock value. */
export default function NamedList({ kind }: { kind: "categories" | "brands" }) {
  const db = useGadgetDB();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const field = kind === "categories" ? "category" : "brand";
  const noun = kind === "categories" ? "category" : "brand";
  const list = db[kind];

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (list.some((x) => x.name.toLowerCase() === n.toLowerCase())) return toast.error(`That ${noun} already exists`);
    saveNamed(kind, n);
    setName("");
    toast.success(`${n} added`);
  };

  return (
    <>
      <AdminHeader title={kind === "categories" ? "Categories" : "Brands"} subtitle={`${list.length} ${kind}`} />
      <form onSubmit={add} className="mb-4 flex max-w-md gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`New ${noun} name`}
          aria-label={`New ${noun} name`}
          className="h-10 flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm outline-none focus:border-orange-400"
        />
        <button className={btn.primary}>
          <Plus className="size-4" /> Add
        </button>
      </form>
      <Table className="max-w-3xl">
        <thead className="bg-neutral-50">
          <tr>
            <th className={th}>Name</th>
            <th className={`${th} text-right`}>Products</th>
            <th className={`${th} text-right`}>Units in stock</th>
            <th className={`${th} text-right`}>Stock value</th>
            <th className={th} />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {list.map((x) => {
            const products = db.products.filter((p) => p[field] === x.name);
            const units = products.reduce((s, p) => s + p.stock, 0);
            const value = products.reduce((s, p) => s + p.stock * p.cost, 0);
            const isEditing = editing?.id === x.id;
            return (
              <tr key={x.id} className="hover:bg-neutral-50">
                <td className={td}>
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      aria-label={`Rename ${x.name}`}
                      className="h-9 w-full rounded-lg border border-orange-300 px-2 text-sm outline-none"
                    />
                  ) : (
                    <span className="font-medium text-neutral-900">{x.name}</span>
                  )}
                </td>
                <td className={`${td} text-right tabular-nums`}>{products.length}</td>
                <td className={`${td} text-right tabular-nums`}>{units}</td>
                <td className={`${td} text-right tabular-nums`}>{formatTaka(value)}</td>
                <td className={`${td} whitespace-nowrap text-right`}>
                  {isEditing ? (
                    <>
                      <button
                        className={btn.ghost}
                        aria-label="Save"
                        onClick={() => {
                          if (editing.name.trim()) saveNamed(kind, editing.name.trim(), x.id);
                          setEditing(null);
                        }}
                      >
                        <Check className="size-4" />
                      </button>
                      <button className={btn.ghost} aria-label="Cancel" onClick={() => setEditing(null)}>
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className={btn.ghost} aria-label={`Rename ${x.name}`} onClick={() => setEditing({ id: x.id, name: x.name })}>
                        <Pencil className="size-4" />
                      </button>
                      <button
                        className={btn.ghostDanger}
                        aria-label={`Delete ${x.name}`}
                        onClick={() => {
                          if (products.length) return toast.error(`Move or delete its ${products.length} products first`);
                          deleteNamed(kind, x.id);
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
        </tbody>
      </Table>
    </>
  );
}
