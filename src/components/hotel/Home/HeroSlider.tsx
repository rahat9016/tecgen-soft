"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { id: "1542314831-068cd1dbfeeb", alt: "Luxury hotel pool lit up at dusk" },
  { id: "1540541338287-41700207dee6", alt: "Clifftop resort pool overlooking the ocean" },
  { id: "1520250497591-112f2f40a3f4", alt: "Tropical resort pool surrounded by palms" },
  { id: "1571003123894-1f0594d2b5d9", alt: "Poolside cabanas at sunset" },
  { id: "1566073771259-6a8506099945", alt: "Wooden beach resort with sun loungers" },
];

const INTERVAL = 6000;

const imageUrl = (id: string, width: number) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&q=85&auto=format&fit=crop`;

export default function HeroSlider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);

  const goTo = (index: number) => setActive((index + slides.length) % slides.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <div className="relative overflow-hidden bg-neutral-900">
      {slides.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- images are unoptimized app-wide; Unsplash srcSet serves the right size
        <img
          key={slide.id}
          src={imageUrl(slide.id, 1920)}
          srcSet={[1280, 1920, 2560].map((w) => `${imageUrl(slide.id, w)} ${w}w`).join(", ")}
          sizes="100vw"
          alt={i === active ? slide.alt : ""}
          aria-hidden={i !== active}
          fetchPriority={i === 0 ? "high" : "low"}
          decoding="async"
          className={`absolute inset-0 size-full object-cover [transition:opacity_1.2s_ease,transform_7s_ease-out] motion-reduce:[transition:opacity_1.2s_ease] ${
            i === active ? "opacity-100 motion-safe:scale-[1.06]" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-neutral-950/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/20 to-neutral-950/80" />

      {children}

      <button
        type="button"
        onClick={() => goTo(active - 1)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 md:flex lg:left-8"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => goTo(active + 1)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 md:flex lg:right-8"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
              i === active ? "w-10 bg-white/35" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          >
            {i === active && (
              <span
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white motion-safe:animate-[hero-progress_6s_linear_forwards]"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
