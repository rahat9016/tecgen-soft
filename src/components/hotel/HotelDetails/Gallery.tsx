"use client";

import { useState } from "react";
import { Grid2x2 } from "lucide-react";
import PhotoLightbox, { sizedPhoto, type LightboxPhoto } from "@/src/components/hotel/shared/PhotoLightbox";

export default function Gallery({ photos }: { photos: LightboxPhoto[] }) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="grid h-[280px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[440px]">
        {photos.slice(0, 5).map(({ src, title }, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Open photo: ${title}`}
            className={`group relative overflow-hidden bg-neutral-200 ${
              i === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block"
            }`}
          >
            <img
              src={sizedPhoto(src, i === 0 ? 1400 : 700)}
              alt={title}
              className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-neutral-950/0 transition group-hover:bg-neutral-950/15" />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIndex(0)}
        className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg backdrop-blur transition hover:bg-white"
      >
        <Grid2x2 className="size-4" />
        Show all {photos.length} photos
      </button>

      <PhotoLightbox photos={photos} index={index} onIndexChange={setIndex} />
    </div>
  );
}
