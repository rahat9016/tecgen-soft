"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, Eye, EyeOff, ImagePlus, Images, Link2, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { compressImage } from "@/src/components/hotel/admin/ImageInput";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { addGalleryImage, moveGalleryImage, removeGalleryImage, updateGalleryImage, useTurfDB } from "@/src/lib/turf-store/store";
import type { GalleryImage } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import { abtn, cardClass, Empty, Field, inputClass, Modal, ViewPills } from "./ui";

type Filter = "all" | "shown" | "hidden";

/** Add a photo by pasting a link or uploading files (downscaled to fit browser storage). */
function ImageInput({ onAdd }: { onAdd: (src: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const addUrl = () => {
    const v = url.trim();
    if (!/^https?:\/\/\S+$/i.test(v)) return toast.error("Paste a full image link starting with https://");
    onAdd(v);
    setUrl("");
  };
  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-56 flex-1">
        <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="Paste image link (https://…)"
          aria-label="Image link"
          className={cn(inputClass, "pl-9")}
        />
      </div>
      <button type="button" onClick={addUrl} className={abtn.outline}>
        Add link
      </button>
      <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className={abtn.outline}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />} Upload
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []).slice(0, 10);
          e.target.value = "";
          if (!files.length) return;
          setBusy(true);
          try {
            for (const f of files) onAdd(await compressImage(f));
          } catch {
            toast.error("That file couldn't be read as an image.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

/** Caption first, then a link or upload adds the photo straight away. */
function AddModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  return (
    <Modal open onClose={onClose} title="Add photos">
      <div className="space-y-3">
        <Field label="Caption" hint="Optional — shown on the photo on the site">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Friday night league" className={inputClass} />
        </Field>
        <div className="border-t border-neutral-100 pt-3">
          <ImageInput
            onAdd={(src) => {
              addGalleryImage({ src, title: title.trim(), visible: true });
              toast.success("Photo added to the gallery");
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

function EditModal({ image, onClose }: { image: GalleryImage; onClose: () => void }) {
  const [title, setTitle] = useState(image.title);
  return (
    <Modal open onClose={onClose} title="Edit photo">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
      <img src={image.src} alt="" className="aspect-video w-full rounded-lg object-cover" />
      <div className="mt-4 space-y-3">
        <Field label="Caption">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4">
          <button onClick={onClose} className={abtn.outline}>
            Cancel
          </button>
          <button
            onClick={() => {
              updateGalleryImage(image.id, { title: title.trim() });
              toast.success("Photo updated");
              onClose();
            }}
            className={abtn.primary}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function GalleryManager() {
  const db = useTurfDB();
  const gallery = db.gallery;
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [adding, setAdding] = useState(false);
  const list = gallery.filter((g) => filter === "all" || (filter === "shown" ? g.visible : !g.visible));
  const shown = gallery.filter((g) => g.visible).length;

  const remove = (g: GalleryImage) => {
    if (!confirm(`Delete “${g.title || "this photo"}”?`)) return;
    removeGalleryImage(g.id);
    toast.success("Photo deleted");
  };
  const iconBtn = "flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-emerald-700 disabled:opacity-40";

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className={cn(cardClass, "mb-3 flex items-center gap-2 sm:mb-4")}>
        <div className="min-w-0 flex-1 [&>div]:border-b-0">
          <ViewPills
            label="Show"
            value={filter}
            onChange={setFilter}
            views={[
              { value: "all", label: "All", count: gallery.length, group: 0 },
              { value: "shown", label: "On the site", count: shown, group: 0 },
              { value: "hidden", label: "Hidden", count: gallery.length - shown, group: 0 },
            ]}
          />
        </div>
        <button onClick={() => setAdding(true)} aria-label="Add photos" className={cn(abtn.primary, "mr-3 size-10 shrink-0 px-0 sm:w-auto sm:px-4")}>
          <ImagePlus className="size-4" /> <span className="hidden sm:inline">Add photos</span>
        </button>
      </div>

      {list.length === 0 ? (
        <div className={cardClass}>
          <Empty icon={Images} title={gallery.length ? "No photos here" : "No photos yet"} text={gallery.length ? "Pick another filter above." : "The gallery section is hidden on the site until you add a photo."} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((g) => {
            const index = gallery.findIndex((x) => x.id === g.id);
            return (
              <article key={g.id} className="group min-w-0">
                <div className={cn("relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100", !g.visible && "outline-dashed outline-2 outline-offset-2 outline-neutral-300")}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                  <img src={g.src} alt={g.title} loading="lazy" className={cn("size-full object-cover transition duration-300 group-hover:scale-[1.03]", !g.visible && "opacity-40 grayscale")} />
                  <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">{index + 1}</span>
                  {!g.visible && <span className="absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded-full bg-neutral-900/80 px-2.5 py-1 text-xs font-semibold text-white">Hidden</span>}
                  {/* Phones: every action in one menu button; with a mouse: a row of buttons on hover. */}
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger aria-label="Actions" className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur sm:hidden">
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={6} className="w-52 rounded-md">
                      <DropdownMenuItem onSelect={() => setEditing(g)} className="cursor-pointer py-2.5">
                        <Pencil /> Edit caption
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => updateGalleryImage(g.id, { visible: !g.visible })} className="cursor-pointer py-2.5">
                        {g.visible ? <EyeOff /> : <Eye />} {g.visible ? "Hide from site" : "Show on site"}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={index === 0} onSelect={() => moveGalleryImage(g.id, -1)} className="cursor-pointer py-2.5">
                        <ArrowLeft /> Move earlier
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={index === gallery.length - 1} onSelect={() => moveGalleryImage(g.id, 1)} className="cursor-pointer py-2.5">
                        <ArrowRight /> Move later
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={() => remove(g)} className="cursor-pointer py-2.5">
                        <Trash2 /> Delete photo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="absolute inset-x-0 bottom-0 hidden items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 sm:flex">
                    <span className="flex gap-1">
                      <button onClick={() => moveGalleryImage(g.id, -1)} disabled={index === 0} aria-label="Move earlier" className={iconBtn}>
                        <ArrowLeft className="size-4" />
                      </button>
                      <button onClick={() => moveGalleryImage(g.id, 1)} disabled={index === gallery.length - 1} aria-label="Move later" className={iconBtn}>
                        <ArrowRight className="size-4" />
                      </button>
                    </span>
                    <span className="flex gap-1">
                      <button onClick={() => updateGalleryImage(g.id, { visible: !g.visible })} aria-label={g.visible ? "Hide from site" : "Show on site"} title={g.visible ? "Hide from site" : "Show on site"} className={iconBtn}>
                        {g.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                      <button onClick={() => setEditing(g)} aria-label="Edit caption" className={iconBtn}>
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => remove(g)} aria-label="Delete photo" className={cn(iconBtn, "hover:text-rose-600")}>
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  </div>
                </div>
                <p className={cn("mt-1.5 truncate px-0.5 text-[13px] font-semibold sm:text-sm", g.visible ? "text-neutral-900" : "text-neutral-500")}>{g.title || "No caption"}</p>
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
