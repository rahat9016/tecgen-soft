"use client";

import { useState } from "react";
import { Expand, Images } from "lucide-react";
import PhotoLightbox, { sizedPhoto } from "@/src/components/hotel/shared/PhotoLightbox";
import { galleryCategoryLabels } from "@/src/lib/hotel-store/format";
import { useHotelDB } from "@/src/lib/hotel-store/store";
import type { GalleryCategory } from "@/src/lib/hotel-store/types";
import SectionHeading from "./SectionHeading";

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

export default function GallerySection() {
  const [index, setIndex] = useState<number | null>(null);
  const [category, setCategory] = useState<GalleryCategory | "all">("all");
  // Photos, their order and captions are managed in the admin panel (Gallery).
  const visible = useHotelDB().content.gallery.filter((g) => g.visible);
  const categories = (Object.keys(galleryCategoryLabels) as GalleryCategory[]).filter((c) => visible.some((g) => g.category === c));
  const photos = visible.filter((g) => category === "all" || g.category === category);
  if (!visible.length) return null;

  return (
    <section id="gallery" className="container scroll-mt-24 py-10">
      <SectionHeading
        title="Photo Gallery"
        subtitle="A look inside our rooms, pool and beachfront."
      />

      {categories.length > 1 && (
        <div className="mt-5 flex gap-2 overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Photo categories">
          {(["all", ...categories] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              onClick={() => {
                setCategory(c);
                setIndex(null);
              }}
              className={`shrink-0 rounded-md px-4 py-1.5 text-sm font-medium transition ${
                category === c ? "bg-sky-600 text-white shadow-sm" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {c === "all" ? "All photos" : galleryCategoryLabels[c]}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid auto-rows-[140px] grid-flow-dense grid-cols-2 gap-3 md:auto-rows-[190px] md:grid-cols-4">
        {photos.slice(0, tileSpans.length).map((photo, i) => {
          const isLast = i === tileSpans.length - 1 && photos.length > tileSpans.length;
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Open photo of ${photo.title}`}
              className={`group relative overflow-hidden rounded-md bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${tileSpans[i]}`}
            >
              <img
                src={sizedPhoto(photo.src, i === 0 ? 1200 : 800)}
                alt={`${photo.title}, ${photo.subtitle}`}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/10 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-2 p-3 text-left text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{photo.title}</p>
                  <p className="truncate text-xs text-white/80">{photo.subtitle}</p>
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

      <PhotoLightbox photos={photos} index={index} onIndexChange={setIndex} />
    </section>
  );
}
