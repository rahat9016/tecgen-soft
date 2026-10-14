"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Images, Pencil, Trash2 } from "lucide-react";
import { galleryCategoryLabels } from "@/src/lib/hotel-store/format";
import { addGalleryImage, moveGalleryImage, removeGalleryImage, updateGalleryImage, useHotelDB } from "@/src/lib/hotel-store/store";
import type { GalleryCategory, GalleryImage } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import ImageInput from "./ImageInput";
import { AdminHeader, Card, Empty, Field, hbtn, inputClass, Modal, Pills } from "./ui";

const categories = Object.keys(galleryCategoryLabels) as GalleryCategory[];

function EditModal({ image, onClose }: { image: GalleryImage; onClose: () => void }) {
  const [form, setForm] = useState(image);
  return (
    <Modal open onClose={onClose} title="Edit photo">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
      <img src={form.src} alt="" className="aspect-video w-full rounded-md object-cover" />
      <div className="mt-4 space-y-3">
        <Field label="Title">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Caption">
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Category">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as GalleryCategory })} className={inputClass}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {galleryCategoryLabels[c]}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className={hbtn.outline}>
            Cancel
          </button>
          <button
            onClick={() => {
              updateGalleryImage(image.id, form);
              toast.success("Photo updated");
              onClose();
            }}
            className={hbtn.primary}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function GalleryManager() {
  const db = useHotelDB();
  const gallery = db.content.gallery;
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [draft, setDraft] = useState({ title: "", subtitle: "", category: "hotel" as GalleryCategory });
  const list = gallery.filter((g) => filter === "all" || g.category === filter);

  return (
    <div>
      <AdminHeader title="Gallery" subtitle={`${gallery.filter((g) => g.visible).length} of ${gallery.length} photos shown on the website · first 7 make the homepage grid`} />

      <Card className="mb-6">
        <h2 className="font-semibold text-neutral-900">Add photos</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title (e.g. Rooftop bar)" className={inputClass} />
          <input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} placeholder="Caption (optional)" className={inputClass} />
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as GalleryCategory })} className={inputClass}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {galleryCategoryLabels[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <ImageInput
            onAdd={(src) => {
              addGalleryImage({ src, title: draft.title.trim() || db.content.hotel.name, subtitle: draft.subtitle.trim() || galleryCategoryLabels[draft.category], category: draft.category, visible: true });
              toast.success("Photo added to the gallery");
            }}
          />
        </div>
      </Card>

      <div className="mb-4">
        <Pills
          value={filter}
          onChange={setFilter}
          options={[{ value: "all" as const, label: "All", count: gallery.length }, ...categories.map((c) => ({ value: c, label: galleryCategoryLabels[c], count: gallery.filter((g) => g.category === c).length }))]}
        />
      </div>

      {list.length === 0 ? (
        <Card>
          <Empty icon={Images} title="No photos in this category" />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((g) => {
            const index = gallery.findIndex((x) => x.id === g.id);
            return (
              <article key={g.id} className={cn("overflow-hidden rounded-md border bg-white", g.visible ? "border-neutral-200" : "border-dashed border-neutral-300 opacity-60")}>
                <div className="relative aspect-[4/3] bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                  <img src={g.src} alt={g.title} className="size-full object-cover" loading="lazy" />
                  <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">#{index + 1}</span>
                  <span className="absolute right-2 top-2 rounded-md bg-sky-950/80 px-2 py-0.5 text-[10px] font-semibold text-white">{galleryCategoryLabels[g.category]}</span>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-neutral-900">{g.title}</p>
                  <p className="truncate text-xs text-neutral-500">{g.subtitle}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="flex">
                      <button onClick={() => moveGalleryImage(g.id, -1)} disabled={index === 0} aria-label="Move earlier" className={cn(hbtn.icon, "disabled:opacity-30")}>
                        <ArrowLeft className="size-4" />
                      </button>
                      <button onClick={() => moveGalleryImage(g.id, 1)} disabled={index === gallery.length - 1} aria-label="Move later" className={cn(hbtn.icon, "disabled:opacity-30")}>
                        <ArrowRight className="size-4" />
                      </button>
                    </span>
                    <span className="flex">
                      <button onClick={() => updateGalleryImage(g.id, { visible: !g.visible })} aria-label={g.visible ? "Hide from website" : "Show on website"} title={g.visible ? "Hide" : "Show"} className={hbtn.icon}>
                        {g.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                      <button onClick={() => setEditing(g)} aria-label="Edit photo" className={hbtn.icon}>
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm(`Delete "${g.title}"?`)) return;
                          removeGalleryImage(g.id);
                          toast.success("Photo deleted");
                        }}
                        aria-label="Delete photo"
                        className={hbtn.iconDanger}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && <EditModal image={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
