"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  const [slide, setSlide] = useState(0);

  return (
    <section className="container pt-6">
      <div className="relative min-h-105 overflow-hidden rounded-2xl bg-emerald-950 text-white shadow-xl md:min-h-120">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/amazed-young-woman-shopaholic-holding-colorful-shopping-bags-look-amused-shop-buying-thi.jpg"
          alt="Happy customer with shopping bags"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/80 to-emerald-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.35)]" />

        <span className="absolute top-4 right-4 z-10 flex size-16 -rotate-6 flex-col items-center justify-center rounded-full bg-amber-400 text-emerald-950 shadow-xl ring-4 ring-amber-300/30 md:top-6 md:right-6 md:size-20">
          <span className="text-[9px] font-semibold tracking-wide md:text-[10px]">UP TO</span>
          <span className="text-lg font-extrabold leading-none md:text-2xl">50%</span>
          <span className="text-[9px] font-semibold tracking-wide md:text-[10px]">OFF</span>
        </span>

        <button
          onClick={() => setSlide((s) => (s + 2) % 3)}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-sm transition hover:bg-white/20 hover:scale-105"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => setSlide((s) => (s + 1) % 3)}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-sm transition hover:bg-white/20 hover:scale-105"
        >
          <ChevronRight className="size-5" />
        </button>

        <div className="relative flex h-full min-h-105 items-center px-6 py-10 md:min-h-120 md:px-14">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-950 shadow-md">
              <Sparkles className="size-3.5" />
              Big Sale Is On
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.15] drop-shadow-md md:text-5xl">
              Best Products
              <br />
              <span className="text-amber-400">Up to 50%</span> Off!
            </h1>
            <p className="mt-4 max-w-md text-sm text-emerald-50/90 md:text-base">
              Best brands, best quality, best prices – all in one place.
              Limited time offer, order now!
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/ecommerce#products"
                className="group inline-flex items-center gap-2 rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-300 hover:shadow-amber-400/30"
              >
                Shop Now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/ecommerce#promos"
                className="inline-flex items-center rounded-md border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/15"
              >
                View Offers
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 pb-4">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full border border-white/20 transition-all duration-300 ${
                slide === i ? "w-8 bg-amber-400 border-amber-400" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
