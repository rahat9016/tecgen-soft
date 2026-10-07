"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/src/components/ui/dialog";

export interface LightboxPhoto {
  src: string;
  title: string;
  subtitle?: string;
}

// Unsplash URLs carry their width as `w=`; swap it to fetch a size that fits the slot.
export const sizedPhoto = (src: string, width: number) => src.replace(/w=\d+/, `w=${width}`);

export default function PhotoLightbox({
  photos,
  index,
  onIndexChange,
}: {
  photos: LightboxPhoto[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}) {
  const current = index === null ? null : photos[index];
  const step = (delta: number) => {
    if (index !== null) onIndexChange((index + delta + photos.length) % photos.length);
  };

  return (
    <Dialog open={index !== null} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="max-w-[calc(100%-1.5rem)] gap-3 border-0 bg-neutral-950 p-3 text-white sm:max-w-5xl sm:p-4 [&>button:last-child]:rounded-full [&>button:last-child]:bg-white/10 [&>button:last-child]:p-1.5 [&>button:last-child]:text-white [&>button:last-child]:opacity-100 [&>button:last-child]:hover:bg-white/20"
      >
        <DialogTitle className="sr-only">Photo gallery</DialogTitle>
        <DialogDescription className="sr-only">
          Use the arrow keys or buttons to browse photos.
        </DialogDescription>

        {current && index !== null && (
          <>
            <div className="relative mt-8 h-[50vh] overflow-hidden rounded-xl bg-black sm:mt-6 sm:h-[62vh]">
              <img
                key={current.src}
                src={sizedPhoto(current.src, 1600)}
                alt={current.subtitle ? `${current.title}, ${current.subtitle}` : current.title}
                className="size-full object-contain animate-in fade-in-0 duration-300"
              />
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition hover:bg-white/30"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition hover:bg-white/30"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 px-1">
              <div className="min-w-0">
                <p className="truncate font-semibold">{current.title}</p>
                {current.subtitle && (
                  <p className="truncate text-xs text-white/60">{current.subtitle}</p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                {index + 1} / {photos.length}
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, i) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => onIndexChange(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${
                    i === index ? "ring-2 ring-amber-400" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={sizedPhoto(photo.src, 200)} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
