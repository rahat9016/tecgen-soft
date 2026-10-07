"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Images } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/src/components/ui/dialog";
import { hotels } from "@/src/data/hotels";
import SectionHeading from "./SectionHeading";

// Round-robin across hotels so the first tiles mix properties instead of showing one hotel's set.
const maxImages = Math.max(...hotels.map((hotel) => hotel.images.length));
const photos = Array.from({ length: maxImages }, (_, i) =>
  hotels.flatMap((hotel) =>
    hotel.images[i] ? [{ src: hotel.images[i], hotel: hotel.name, location: hotel.location }] : []
  )
)
  .flat()
  .filter((photo, i, all) => all.findIndex((p) => p.src === photo.src) === i);

// Bento layout for the 7 visible tiles on md+ (grid-flow-dense fills the gaps).
const tileSpans = [
  "col-span-2 row-span-2",
  "",
  "md:row-span-2",
  "",
  "",
  "md:col-span-2",
  "",
];

const sized = (src: string, width: number) => src.replace(/w=\d+/, `w=${width}`);

export default function GallerySection() {
  const [index, setIndex] = useState<number | null>(null);
  const current = index === null ? null : photos[index];
  const step = (delta: number) =>
    setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length));

  return (
    <section className="container py-10">
      <SectionHeading
        title="Photo Gallery"
        subtitle="Pools, rooms and views from the stays our guests love."
      />

      <div className="mt-6 grid auto-rows-[140px] grid-flow-dense grid-cols-2 gap-3 md:auto-rows-[190px] md:grid-cols-4">
        {photos.slice(0, tileSpans.length).map((photo, i) => {
          const isLast = i === tileSpans.length - 1 && photos.length > tileSpans.length;
          return (
            <button
              key={photo.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Open photo of ${photo.hotel}`}
              className={`group relative overflow-hidden rounded-2xl bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${tileSpans[i]}`}
            >
              <img
                src={sized(photo.src, i === 0 ? 1200 : 800)}
                alt={`${photo.hotel}, ${photo.location}`}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/10 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-2 p-3 text-left text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{photo.hotel}</p>
                  <p className="truncate text-xs text-white/80">{photo.location}</p>
                </div>
                <Expand className="size-4 shrink-0" />
              </div>

              {isLast && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-neutral-950/55 text-white backdrop-blur-[2px] transition group-hover:bg-neutral-950/65">
                  <Images className="size-6" />
                  <span className="text-sm font-semibold">+{photos.length - tileSpans.length + 1} photos</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={index !== null} onOpenChange={(open) => !open && setIndex(null)}>
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
                  src={sized(current.src, 1600)}
                  alt={`${current.hotel}, ${current.location}`}
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
                  <p className="truncate font-semibold">{current.hotel}</p>
                  <p className="truncate text-xs text-white/60">{current.location}</p>
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
                    onClick={() => setIndex(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={i === index}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${
                      i === index ? "ring-2 ring-amber-400" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={sized(photo.src, 200)} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
