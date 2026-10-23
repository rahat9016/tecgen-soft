"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, ImagePlus, Images, MoreVertical, Pencil, SlidersHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { galleryCategoryLabels } from "@/src/lib/hotel-store/format";
import { useT } from "@/src/lib/hotel-store/i18n";
import { addGalleryImage, moveGalleryImage, removeGalleryImage, updateGalleryImage, useHotelDB } from "@/src/lib/hotel-store/store";
import type { GalleryCategory, GalleryImage } from "@/src/lib/hotel-store/types";
import { cn } from "@/src/lib/utils";
import ImageInput from "./ImageInput";
import { Card, Empty, Field, hbtn, inputClass, Modal, Pills } from "./ui";

const categories = Object.keys(galleryCategoryLabels) as GalleryCategory[];

function CategorySelect({ value, onChange }: { value: GalleryCategory; onChange: (c: GalleryCategory) => void }) {
  const t = useT();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as GalleryCategory)} className={inputClass}>
      {categories.map((c) => (
        <option key={c} value={c}>
          {t(galleryCategoryLabels[c])}
        </option>
      ))}
    </select>
  );
}

function EditModal({ image, onClose }: { image: GalleryImage; onClose: () => void }) {
  const t = useT();
  const [form, setForm] = useState(image);
  return (
    <Modal open onClose={onClose} title={t("Edit photo")}>
      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
      <img src={form.src} alt="" className="aspect-video w-full rounded-lg object-cover" />
      <div className="mt-4 space-y-3">
        <Field label="Title">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Caption">
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Category">
          <CategorySelect value={form.category} onChange={(category) => setForm({ ...form, category })} />
        </Field>
        <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4">
          <button onClick={onClose} className={hbtn.outline}>
            {t("Cancel")}
          </button>
          <button
            onClick={() => {
              updateGalleryImage(image.id, form);
              toast.success(t("Photo updated"));
              onClose();
            }}
            className={hbtn.primary}
          >
            {t("Save")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** Title, caption and category first, then a link or upload adds the photo straight away. */
function AddModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const db = useHotelDB();
  const [draft, setDraft] = useState({ title: "", subtitle: "", category: "hotel" as GalleryCategory });
  return (
    <Modal open onClose={onClose} title={t("Add photos")}>
      <div className="space-y-3">
        <Field label="Title">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={t("e.g. Rooftop bar")} className={inputClass} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Caption">
            <input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} placeholder={t("Optional")} className={inputClass} />
          </Field>
          <Field label="Category">
            <CategorySelect value={draft.category} onChange={(category) => setDraft({ ...draft, category })} />
          </Field>
        </div>
        <div className="border-t border-neutral-100 pt-3">
          <ImageInput
            onAdd={(src) => {
              addGalleryImage({
                src,
                title: draft.title.trim() || db.content.hotel.name,
                subtitle: draft.subtitle.trim() || galleryCategoryLabels[draft.category],
                category: draft.category,
                visible: true,
              });
              toast.success(t("Photo added to the gallery"));
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

export default function GalleryManager() {
  const t = useT();
  const db = useHotelDB();
  const gallery = db.content.gallery;
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [adding, setAdding] = useState(false);
  const list = gallery.filter((g) => filter === "all" || g.category === filter);

  const iconBtn = "flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-sky-700 disabled:opacity-40";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2.5 sm:mb-4 sm:p-3">
        {/* Phones: one filter button with the categories in a menu. */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className={cn(hbtn.outline, "h-10 min-w-0 flex-1 justify-start gap-2 px-3 sm:hidden", filter !== "all" && "border-sky-500 bg-sky-50 text-sky-900")}>
            <SlidersHorizontal className="size-4 shrink-0" />
            <span className="truncate">{filter === "all" ? t("All") : t(galleryCategoryLabels[filter])}</span>
            <span className="ml-auto rounded-full bg-neutral-100 px-1.5 text-xs font-semibold tabular-nums text-neutral-600">{list.length}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={6} className="w-56 rounded-md">
            <DropdownMenuLabel className="text-xs text-neutral-500">{t("Category")}</DropdownMenuLabel>
            {(["all", ...categories] as const).map((c) => (
              <DropdownMenuItem key={c} onSelect={() => setFilter(c)} className="cursor-pointer py-2.5">
                <Check className={cn("size-4", filter === c ? "text-sky-600" : "opacity-0")} />
                {c === "all" ? t("All") : t(galleryCategoryLabels[c])}
                <span className="ml-auto text-xs tabular-nums text-neutral-500">{c === "all" ? gallery.length : gallery.filter((g) => g.category === c).length}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden min-w-0 flex-1 sm:block">
          <Pills
            size="md"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all" as const, label: "All", count: gallery.length },
              ...categories.map((c) => ({ value: c, label: galleryCategoryLabels[c], count: gallery.filter((g) => g.category === c).length })),
            ]}
          />
        </div>
        <button onClick={() => setAdding(true)} aria-label={t("Add photos")} className={cn(hbtn.primary, "size-10 shrink-0 px-0 sm:w-auto sm:px-4")}>
          <ImagePlus className="size-4" /> <span className="hidden sm:inline">{t("Add photos")}</span>
        </button>
      </div>

      {list.length === 0 ? (
        <Card>
          <Empty icon={Images} title="No photos in this category" />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((g) => {
            const index = gallery.findIndex((x) => x.id === g.id);
            return (
              <article key={g.id} className="group min-w-0">
                <div className={cn("relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-100", !g.visible && "outline-2 outline-offset-2 outline-dashed outline-neutral-300")}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                  <img src={g.src} alt={g.title} loading="lazy" className={cn("size-full object-cover transition duration-300 group-hover:scale-[1.03]", !g.visible && "opacity-40 grayscale")} />
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur sm:left-2 sm:top-2 sm:px-2 sm:text-[11px]">{index + 1}</span>
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-800 sm:right-2 sm:top-2 sm:px-2 sm:text-[11px]">{t(galleryCategoryLabels[g.category])}</span>
                  {!g.visible && (
                    <span className="absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded-full bg-neutral-900/80 px-2.5 py-1 text-xs font-semibold text-white">{t("Hidden")}</span>
                  )}
                  {/* Phones: every action in one menu button; with a mouse: a row of buttons on hover. */}
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger aria-label={t("Actions")} className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur sm:hidden">
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={6} className="w-52 rounded-md">
                      <DropdownMenuItem onSelect={() => setEditing(g)} className="cursor-pointer py-2.5">
                        <Pencil /> {t("Edit photo")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => updateGalleryImage(g.id, { visible: !g.visible })} className="cursor-pointer py-2.5">
                        {g.visible ? <EyeOff /> : <Eye />} {g.visible ? t("Hide from website") : t("Show on website")}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={index === 0} onSelect={() => moveGalleryImage(g.id, -1)} className="cursor-pointer py-2.5">
                        <ArrowLeft /> {t("Move earlier")}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={index === gallery.length - 1} onSelect={() => moveGalleryImage(g.id, 1)} className="cursor-pointer py-2.5">
                        <ArrowRight /> {t("Move later")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => {
                          if (!confirm(t("Delete “{title}”?", { title: g.title }))) return;
                          removeGalleryImage(g.id);
                          toast.success(t("Photo deleted"));
                        }}
                        className="cursor-pointer py-2.5"
                      >
                        <Trash2 /> {t("Delete photo")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="absolute inset-x-0 bottom-0 hidden items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 sm:flex">
                    <span className="flex gap-1">
                      <button onClick={() => moveGalleryImage(g.id, -1)} disabled={index === 0} aria-label={t("Move earlier")} className={iconBtn}>
                        <ArrowLeft className="size-4" />
                      </button>
                      <button onClick={() => moveGalleryImage(g.id, 1)} disabled={index === gallery.length - 1} aria-label={t("Move later")} className={iconBtn}>
                        <ArrowRight className="size-4" />
                      </button>
                    </span>
                    <span className="flex gap-1">
                      <button onClick={() => updateGalleryImage(g.id, { visible: !g.visible })} aria-label={g.visible ? t("Hide from website") : t("Show on website")} className={iconBtn}>
                        {g.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                      <button onClick={() => setEditing(g)} aria-label={t("Edit photo")} className={iconBtn}>
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm(t("Delete “{title}”?", { title: g.title }))) return;
                          removeGalleryImage(g.id);
                          toast.success(t("Photo deleted"));
                        }}
                        aria-label={t("Delete photo")}
                        className={cn(iconBtn, "hover:text-rose-600")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  </div>
                </div>
                <p className={cn("mt-1.5 truncate px-0.5 text-[13px] font-semibold sm:text-sm", g.visible ? "text-neutral-900" : "text-neutral-500")}>{g.title}</p>
              </article>
            );
          })}
        </div>
      )}

      {adding && <AddModal onClose={() => setAdding(false)} />}
      {editing && <EditModal image={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
