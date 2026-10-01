"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

const slides = [
  {
    src: "/gadgets/banner1.webp",
    alt: "0% EMI up to 12 months on iPhone 17 Pro & Pro Max with EBL & City credit cards",
    href: "/gadgets/product/iphone-17-pro-max",
  },
  {
    src: "/gadgets/banner2.webp",
    alt: "The new iPhone era — pre-order iPhone 18 Pro Series and iPhone Duo",
    href: "/gadgets/pre-order",
  },
  {
    src: "/gadgets/banner3.webp",
    alt: "Samsung Galaxy S26 Ultra — pre-order with 36 months EMI",
    href: "/gadgets/product/galaxy-s26-ultra",
  },
  { src: "/gadgets/banner4.webp", alt: "PC build to laptop, everything in one place", href: "/gadgets/shop?category=Laptops" },
];

const sidePromos = [
  {
    title: "AirPods Max",
    subtitle: "Pure high-fidelity audio",
    price: "৳64,999",
    image: "/gadgets/airpods-max.webp",
  },
  {
    title: "JBL Flip 5",
    subtitle: "Bold sound, waterproof",
    price: "৳12,499",
    image: "/gadgets/jbl-flip.webp",
  },
];

export default function GadgetHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [index]);

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <section className="container mt-5 grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="group relative aspect-[16/9] overflow-hidden rounded-2xl bg-neutral-100">
        {slides.map((slide, i) => (
          // Banner art has its CTA (e.g. "Pre-order Now") painted in, so the whole slide is the link.
          <Link
            key={slide.src}
            href={slide.href}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              fetchPriority={i === 0 ? "high" : "auto"}
              className="size-full object-cover"
            />
          </Link>
        ))}

        <button
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 opacity-0 shadow transition group-hover:opacity-100"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 opacity-0 shadow transition group-hover:opacity-100"
        >
          <ChevronRight className="size-5" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-orange-500" : "w-1.5 bg-neutral-400/70"
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        {sidePromos.map((p) => (
          <Link
            key={p.title}
            href="#featured"
            className="group relative flex aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-900 text-white lg:aspect-auto"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image}
              alt={p.title}
              className="absolute inset-0 size-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="relative mt-auto p-4">
              <p className="text-xs text-white/70">{p.subtitle}</p>
              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-white/80">
                Only <span className="text-lg font-bold text-orange-400">{p.price}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
