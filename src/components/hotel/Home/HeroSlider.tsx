"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sizedPhoto } from "@/src/components/hotel/shared/PhotoLightbox";
import { useHotelDB } from "@/src/lib/hotel-store/store";

const INTERVAL = 6000;

/** Slides are managed in the admin panel (Content → Homepage). */
const useSlides = () => useHotelDB().content.hero.slides;

// Dots live in the hero content (normal flow, pinned to the bottom) so they can never sit on the search bar.
const SliderContext = createContext<{
  active: number;
  goTo: (index: number) => void;
} | null>(null);

export function HeroSliderDots() {
  const slider = useContext(SliderContext);
  const slides = useSlides();
  if (!slider || slides.length < 2) return null;
  const { active, goTo } = slider;

  return (
    <div className="flex items-center justify-center gap-2">
      {slides.map((slide, i) => (
        <button
          key={slide.id}
          type="button"
          onClick={() => goTo(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === active}
          className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
            i === active
              ? "w-10 bg-white/35"
              : "w-1.5 bg-white/50 hover:bg-white/80"
          }`}
        >
          {i === active && (
            <span className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white motion-safe:animate-[hero-progress_6s_linear_forwards]" />
          )}
        </button>
      ))}
    </div>
  );
}

export default function HeroSlider({ children }: { children: ReactNode }) {
  const slides = useSlides();
  const [picked, setActive] = useState(0);
  // Slides can be removed in the admin while this page is open.
  const active = slides.length ? picked % slides.length : 0;

  const goTo = (index: number) =>
    setActive((index + slides.length) % Math.max(1, slides.length));

  useEffect(() => {
    if (
      slides.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setTimeout(
      () => setActive((i) => (i + 1) % slides.length),
      INTERVAL
    );
    return () => clearTimeout(timer);
  }, [active, slides.length]);

  return (
    <div className="relative overflow-hidden bg-neutral-900">
      {slides.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- images are unoptimized app-wide; Unsplash srcSet serves the right size
        <img
          key={slide.id}
          src={sizedPhoto(slide.src, 1920)}
          srcSet={
            slide.src.startsWith("http")
              ? [1280, 1920, 2560]
                  .map((w) => `${sizedPhoto(slide.src, w)} ${w}w`)
                  .join(", ")
              : undefined
          }
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

      <SliderContext.Provider value={{ active, goTo }}>
        {children}
      </SliderContext.Provider>

      {slides.length > 1 && (
        <>
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
        </>
      )}
    </div>
  );
}
