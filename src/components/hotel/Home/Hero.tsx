"use client";

import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ArrowRight } from "lucide-react";
import { useHotelDB } from "@/src/lib/hotel-store/store";
import HeroSlider, { HeroSliderDots } from "./HeroSlider";
import SearchWidget from "./SearchWidget";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function Hero() {
  const { title, highlight } = useHotelDB().content.hero;
  return (
    <section className="relative -mt-(--hotel-header-h)">
      <HeroSlider>
        <div className={`${jakarta.className} container relative flex min-h-[calc(460px+var(--hotel-header-h))] flex-col items-center justify-center pb-24 pt-[calc(var(--hotel-header-h)+2rem)] text-center text-white sm:min-h-[calc(560px+var(--hotel-header-h))] sm:pt-[calc(var(--hotel-header-h)+3rem)] md:min-h-[calc(700px+var(--hotel-header-h))] md:pb-36`}>
          <h1 className="mt-auto max-w-3xl text-[min(2.5rem,calc((100vw_-_2rem)*0.094))] font-extrabold leading-[1.08] tracking-[-0.03em] drop-shadow-md sm:text-5xl md:text-7xl">
            {title}
            <span className="mt-1 block bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
              {highlight}
            </span>
          </h1>

          <div className="mb-auto mt-6 flex items-center justify-center gap-3 sm:mt-7">
            <Link
              href="/hotel-management/rooms"
              className="flex items-center justify-center gap-1.5 rounded-md bg-sky-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/30 transition hover:bg-sky-700"
            >
              View Rooms <ArrowRight className="size-4" />
            </Link>
            <a
              href="#gallery"
              className="hidden items-center justify-center rounded-md border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:flex"
            >
              Take a Tour
            </a>
          </div>

          <div className="mt-8">
            <HeroSliderDots />
          </div>
        </div>
      </HeroSlider>

      <div className="container relative z-10 -mt-20 md:-mt-32 md:mb-12">
        <SearchWidget />
      </div>
    </section>
  );
}
