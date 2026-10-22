"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ImagePlus, Link2, Maximize2, RotateCcw, Star, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { compressImage } from "../ImageInput";
import { hbtn } from "../ui";
import type { Photo } from "./model";
import { ctl, FieldError, focusRing } from "./parts";

const MAX_PHOTOS = 12;
const MAX_MB = 10;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

let seq = 0;
const photoId = () => `p${Date.now().toString(36)}${seq++}`;
export const readyPhoto = (src: string): Photo => ({ id: photoId(), src, status: "ready", progress: 100 });

type SetPhotos = React.Dispatch<React.SetStateAction<Photo[]>>;

const iconBtn = cn("flex size-8 items-center justify-center rounded-md bg-white/95 text-neutral-800 shadow-sm transition hover:bg-white disabled:opacity-30", focusRing);

/** The room's photos: upload several at once, reorder, preview, choose the main one, and undo a removal. */
export default function PhotoManager({ photos, setPhotos, error }: { photos: Photo[]; setPhotos: SetPhotos; error?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rejected, setRejected] = useState<string[]>([]);
  const [removed, setRemoved] = useState<{ photo: Photo; index: number } | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dropping, setDropping] = useState(false);

  const patch = (id: string, p: Partial<Photo>) => setPhotos((list) => list.map((x) => (x.id === id ? { ...x, ...p } : x)));

  /** Compresses in the browser; the bar creeps up meanwhile so staff can see it's working. */
  const upload = (photo: Photo) => {
    if (!photo.file) return;
    patch(photo.id, { status: "uploading", progress: 5, error: undefined });
    const timer = setInterval(() => setPhotos((list) => list.map((x) => (x.id === photo.id && x.status === "uploading" ? { ...x, progress: Math.min(90, x.progress + 12) } : x))), 150);
    compressImage(photo.file)
      .then((src) => {
        patch(photo.id, { src, status: "ready", progress: 100, file: undefined });
        URL.revokeObjectURL(photo.src);
      })
      .catch(() => patch(photo.id, { status: "error", error: "Couldn't read this image" }))
      .finally(() => clearInterval(timer));
  };

  const addFiles = (files: File[]) => {
    const bad: string[] = [];
    const ok = files.filter((f) => {
      if (!TYPES.includes(f.type)) bad.push(`${f.name}: use JPG, PNG or WebP`);
      else if (f.size > MAX_MB * 1024 * 1024) bad.push(`${f.name}: larger than ${MAX_MB} MB`);
      else return true;
      return false;
    });
    const room = MAX_PHOTOS - photos.length;
    if (ok.length > room) bad.push(`Only ${MAX_PHOTOS} photos per room — ${ok.length - room} not added`);
    setRejected(bad);
    const added = ok.slice(0, Math.max(0, room)).map((file): Photo => ({ id: photoId(), src: URL.createObjectURL(file), status: "uploading", progress: 0, file }));
    if (!added.length) return;
    setPhotos((list) => [...list, ...added]);
    added.forEach(upload);
  };

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= photos.length) return;
    setPhotos((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const remove = (i: number) => {
    setRemoved({ photo: photos[i], index: i });
    setPhotos((list) => list.filter((_, j) => j !== i));
    if (viewing !== null) setViewing(null);
  };
  const undo = () => {
    if (!removed) return;
    setPhotos((list) => {
      const next = [...list];
      next.splice(Math.min(removed.index, next.length), 0, removed.photo);
      return next;
    });
    setRemoved(null);
  };
  useEffect(() => {
    if (!removed) return;
    const t = setTimeout(() => setRemoved(null), 8000);
    return () => clearTimeout(t);
  }, [removed]);

  const full = photos.length >= MAX_PHOTOS;

  return (
    <div id="field-photos" tabIndex={-1} className="outline-none">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" aria-label="Room photos">
        {photos.map((p, i) => (
          <li
            key={p.id}
            draggable={p.status === "ready"}
            onDragStart={(e) => {
              setDragFrom(i);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              if (dragFrom === null) return;
              e.preventDefault();
              setDragOver(i);
            }}
            onDragLeave={() => setDragOver((o) => (o === i ? null : o))}
            onDrop={(e) => {
              if (dragFrom === null) return;
              e.preventDefault();
              move(dragFrom, i);
              setDragFrom(null);
              setDragOver(null);
            }}
            onDragEnd={() => {
              setDragFrom(null);
              setDragOver(null);
            }}
            className={cn(
              "group relative aspect-4/3 overflow-hidden rounded-md bg-neutral-100 ring-1 ring-neutral-200",
              p.status === "ready" && "cursor-grab active:cursor-grabbing",
              i === 0 && "ring-2 ring-sky-600",
              dragOver === i && dragFrom !== i && "ring-2 ring-sky-400 ring-offset-2",
              dragFrom === i && "opacity-40"
            )}
          >
            <button
              type="button"
              onClick={() => setViewing(i)}
              disabled={p.status !== "ready"}
              aria-label={`View photo ${i + 1} full size`}
              className={cn("block size-full", focusRing, "focus-visible:ring-offset-0 focus-visible:ring-inset")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of local/remote files */}
              <img src={p.src} alt="" draggable={false} className={cn("size-full object-cover", p.status !== "ready" && "opacity-60")} />
            </button>

            <span className={cn("pointer-events-none absolute left-2 top-2 rounded px-1.5 py-0.5 text-[11px] font-semibold text-white", i === 0 ? "bg-sky-600" : "bg-black/60")}>
              {i === 0 ? "Main photo" : i + 1}
            </span>

            <button type="button" onClick={() => remove(i)} aria-label={`Remove photo ${i + 1}`} className={cn(iconBtn, "absolute right-2 top-2 size-7 text-rose-700")}>
              <X className="size-4" />
            </button>

            {p.status === "uploading" && (
              <div className="absolute inset-x-2 bottom-2 rounded bg-black/65 px-2 py-1.5 text-[11px] font-medium text-white">
                Uploading… {p.progress}%
                <div role="progressbar" aria-label={`Uploading photo ${i + 1}`} aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} className="mt-1 h-1 overflow-hidden rounded-full bg-white/30">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            )}

            {p.status === "error" && (
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded bg-rose-700 px-2 py-1.5 text-[11px] font-medium text-white">
                <span className="truncate">{p.error ?? "Upload failed"}</span>
                {p.file && (
                  <button type="button" onClick={() => upload(p)} className={cn("flex shrink-0 items-center gap-1 rounded bg-white px-2 py-1 font-semibold text-rose-700", focusRing)}>
                    <RotateCcw className="size-3" /> Retry
                  </button>
                )}
              </div>
            )}

            {p.status === "ready" && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`} className={iconBtn}>
                  <ChevronLeft className="size-4" />
                </button>
                {i > 0 ? (
                  <button type="button" onClick={() => move(i, 0)} aria-label={`Make photo ${i + 1} the main photo`} className={cn(iconBtn, "gap-1 text-xs font-semibold text-sky-800 sm:w-auto sm:px-2")}>
                    <Star className="size-3.5" />
                    <span className="hidden sm:inline">Make main</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => setViewing(i)} aria-label="View main photo full size" className={iconBtn}>
                    <Maximize2 className="size-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === photos.length - 1} aria-label={`Move photo ${i + 1} later`} className={iconBtn}>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </li>
        ))}

        {!full && (
          <li>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                if (dragFrom !== null) return;
                e.preventDefault();
                setDropping(true);
              }}
              onDragLeave={() => setDropping(false)}
              onDrop={(e) => {
                if (dragFrom !== null) return;
                e.preventDefault();
                setDropping(false);
                addFiles(Array.from(e.dataTransfer.files));
              }}
              className={cn(
                "flex aspect-4/3 w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-2 text-center text-sm font-medium transition",
                dropping ? "border-sky-500 bg-sky-50 text-sky-800" : error ? "border-rose-400 text-rose-700" : "border-neutral-300 text-neutral-700 hover:border-sky-400 hover:bg-sky-50/60 hover:text-sky-800",
                focusRing
              )}
            >
              <ImagePlus className="size-6" aria-hidden />
              {photos.length ? "Add more" : "Upload photos"}
              <span className="text-xs font-normal text-neutral-600">or drop them here</span>
            </button>
          </li>
        )}
      </ul>

      <p className="mt-2.5 text-xs text-neutral-600">
        JPG, PNG or WebP · up to {MAX_MB} MB each · landscape 4:3 looks best (e.g. 1600 × 1200) · {photos.length}/{MAX_PHOTOS} added
        {photos.length > 1 && " · drag or use the arrows to reorder"}
      </p>

      <FieldError id="field-photos-error" message={error} />

      {rejected.length > 0 && (
        <div className="mt-2 flex items-start justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900" role="alert">
          <ul className="space-y-0.5">
            {rejected.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <button type="button" onClick={() => setRejected([])} aria-label="Dismiss" className={cn("shrink-0 rounded text-rose-800", focusRing)}>
            <X className="size-4" />
          </button>
        </div>
      )}

      <div aria-live="polite">
        {removed && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">
            Photo removed.
            <button type="button" onClick={undo} className={cn("rounded px-2 py-0.5 font-semibold text-sky-300 hover:text-sky-200", focusRing)}>
              Undo
            </button>
          </div>
        )}
      </div>

      <PhotoLink disabled={full} onAdd={(src) => setPhotos((list) => [...list, readyPhoto(src)])} />

      <input
        ref={fileRef}
        type="file"
        accept={TYPES.join(",")}
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          addFiles(files);
        }}
      />

      {viewing !== null && photos[viewing] && (
        <Lightbox
          photos={photos}
          index={viewing}
          onIndex={setViewing}
          onMakeMain={(i) => {
            move(i, 0);
            setViewing(0);
          }}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

/** Collapsed by default — most photos come from the camera roll, not a link. */
function PhotoLink({ onAdd, disabled }: { onAdd: (src: string) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const add = () => {
    const v = url.trim();
    if (!/^https?:\/\/\S+$/i.test(v)) return setError("Paste a full link starting with https://");
    onAdd(v);
    setUrl("");
    setError("");
  };
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="photo-url"
        disabled={disabled}
        className={cn("inline-flex items-center gap-1.5 rounded text-sm font-medium text-sky-700 hover:text-sky-800 disabled:text-neutral-400", focusRing)}
      >
        <Link2 className="size-4" /> Add image by URL
        <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div id="photo-url" className="mt-2">
          <div className="flex gap-2">
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
              type="url"
              aria-label="Image URL"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "photo-url-error" : undefined}
              placeholder="https://…/room-109.jpg"
              className={ctl(!!error)}
            />
            <button type="button" onClick={add} className={hbtn.outline}>
              Add
            </button>
          </div>
          <FieldError id="photo-url-error" message={error} />
        </div>
      )}
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onIndex,
  onMakeMain,
  onClose,
}: {
  photos: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onMakeMain: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
      if (e.key === "ArrowRight" && index < photos.length - 1 && photos[index + 1].status === "ready") onIndex(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos, onIndex, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} of ${photos.length}`} className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4" onClick={onClose}>
      <div className="flex items-center justify-between gap-3 text-sm text-white" onClick={(e) => e.stopPropagation()}>
        <span>
          Photo {index + 1} of {photos.length}
          {index === 0 && " · Main photo"}
        </span>
        <div className="flex gap-2">
          {index > 0 && (
            <button type="button" onClick={() => onMakeMain(index)} className={cn("inline-flex h-9 items-center gap-1.5 rounded-md bg-white px-3 text-sm font-semibold text-sky-800", focusRing)}>
              <Star className="size-4" /> Make main
            </button>
          )}
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close preview" className={cn("flex size-9 items-center justify-center rounded-md bg-white/15 text-white hover:bg-white/25", focusRing)}>
            <X className="size-5" />
          </button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
        <img src={photos[index].src} alt={`Photo ${index + 1}`} className="max-h-full max-w-full rounded object-contain" onClick={(e) => e.stopPropagation()} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onIndex(index - 1);
          }}
          disabled={index === 0}
          aria-label="Previous photo"
          className={cn("absolute left-0 flex size-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-20", focusRing)}
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onIndex(index + 1);
          }}
          disabled={index >= photos.length - 1 || photos[index + 1].status !== "ready"}
          aria-label="Next photo"
          className={cn("absolute right-0 flex size-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-20", focusRing)}
        >
          <ChevronRight className="size-6" />
        </button>
      </div>
    </div>
  );
}
