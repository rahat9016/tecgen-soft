"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Backpack, Headphones, Watch } from "lucide-react";

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

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 px-6 py-12 md:px-14 md:py-16">
          <div>
            <span className="inline-block rounded-full bg-amber-400 px-4 py-1 text-xs font-semibold text-emerald-950">
              বড় সেল চলছে
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight">
              সেরা পণ্যে
              <br />
              ৫০% পর্যন্ত ছাড়!
            </h1>
            <p className="mt-4 max-w-md text-sm md:text-base text-emerald-100">
              সেরা ব্র্যান্ড, সেরা মান, সেরা দাম – সব এক জায়গায়। সীমিত সময়ের
              অফার, এখনই অর্ডার করুন!
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#products"
                className="rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-emerald-950 hover:bg-amber-300"
              >
                এখনই কিনুন
              </Link>
              <Link
                href="/#promos"
                className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/10"
              >
                অফার দেখুন
              </Link>
            </div>
          </div>

          <div className="relative hidden md:flex items-center justify-center">
            <div className="relative flex size-72 items-center justify-center rounded-full bg-emerald-800/60">
              <Backpack className="size-32 text-emerald-100" strokeWidth={1} />
              <span className="absolute -left-2 top-6 flex size-16 items-center justify-center rounded-full bg-emerald-700 shadow-lg">
                <Headphones className="size-8" />
              </span>
              <span className="absolute -right-2 bottom-8 flex size-16 items-center justify-center rounded-full bg-emerald-700 shadow-lg">
                <Watch className="size-8" />
              </span>
              <span className="absolute -top-4 right-6 flex size-20 flex-col items-center justify-center rounded-full bg-amber-400 text-emerald-950 shadow-xl">
                <span className="text-[10px] font-semibold">UP TO</span>
                <span className="text-xl font-extrabold leading-none">50%</span>
                <span className="text-[10px] font-semibold">OFF</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 pb-5">
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
