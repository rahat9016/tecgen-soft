"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeroIllustration from "./HeroIllustration";

export default function Hero() {
  const [slide, setSlide] = useState(0);

  return (
    <section className="container pt-6">
      <div className="relative overflow-hidden rounded-2xl bg-emerald-950 text-white">
        <button
          onClick={() => setSlide((s) => (s + 2) % 3)}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => setSlide((s) => (s + 1) % 3)}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <ChevronRight className="size-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 px-6 py-6 md:px-14 md:py-8">
          <div>
            <span className="inline-block rounded-full bg-amber-400 px-4 py-1 text-xs font-semibold text-emerald-950">
              বড় সেল চলছে
            </span>
            <h1 className="mt-3 text-2xl md:text-4xl font-extrabold leading-tight">
              সেরা পণ্যে
              <br />
              ৫০% পর্যন্ত ছাড়!
            </h1>
            <p className="mt-3 max-w-md text-sm text-emerald-100">
              সেরা ব্র্যান্ড, সেরা মান, সেরা দাম – সব এক জায়গায়। সীমিত সময়ের
              অফার, এখনই অর্ডার করুন!
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/ecommerce#products"
                className="rounded-md bg-amber-400 px-6 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-amber-300"
              >
                এখনই কিনুন
              </Link>
              <Link
                href="/ecommerce#promos"
                className="rounded-md border border-white/40 px-6 py-2.5 text-sm font-semibold hover:bg-white/10"
              >
                অফার দেখুন
              </Link>
            </div>
          </div>

          <div className="relative hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-65 aspect-square">
              <HeroIllustration />
              <span className="absolute top-0 right-2 flex size-16 flex-col items-center justify-center rounded-full bg-amber-400 text-emerald-950 shadow-xl">
                <span className="text-[9px] font-semibold">UP TO</span>
                <span className="text-lg font-extrabold leading-none">50%</span>
                <span className="text-[9px] font-semibold">OFF</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 pb-4">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                slide === i ? "w-6 bg-amber-400" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
