"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import BrowserFrame from "@/src/components/agency/BrowserFrame";

const easeOut = [0.21, 0.47, 0.32, 0.98] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { y: 22 },
  show: { y: 0, transition: { duration: 0.6, ease: easeOut } },
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-svh min-h-[640px] flex-col overflow-hidden bg-[#0a0a0a]"
    >
      {/* backdrop — spotlight, dot grid and a perspective floor, drawn in CSS so it stays crisp and light */}
      <motion.div
        style={{ y: bgY }}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-[calc(100%+120px)] w-full"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-8%,rgba(61,46,249,0.38),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_30%_at_50%_0%,rgba(255,255,255,0.12),transparent_70%)]" />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 65% 55% at 50% 25%, #000 25%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 25%, #000 25%, transparent 80%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-3/5 [perspective:700px]">
          <div
            className="absolute inset-x-[-50%] top-0 bottom-0 origin-bottom [transform:rotateX(62deg)]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.09) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "linear-gradient(to top, #000 10%, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to top, #000 10%, transparent 85%)",
            }}
          />
        </div>

        {/* horizon glow where the floor meets the spotlight */}
        <div className="absolute inset-x-0 top-[48%] mx-auto h-px w-3/4 bg-linear-to-r from-transparent via-indigo-300/40 to-transparent" />
        <div className="absolute inset-x-0 top-[48%] mx-auto h-24 w-2/3 -translate-y-1/2 rounded-full bg-[#3D2EF9]/15 blur-3xl" />
      </motion.div>

      {/* fine grain texture for a premium, non-flat feel */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden="true">
        <filter id="agency-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#agency-noise)" />
      </svg>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ y: contentY, opacity: heroOpacity }}
        className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 pt-[calc(4rem+6vh)] sm:px-6 lg:px-8"
      >
        <motion.h1
          variants={item}
          className="mx-auto max-w-5xl text-center text-[2rem] leading-[1.2] font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]"
        >
          <span className="block">The Right Software to</span>
          <span className="mt-2 block">
            <span className="bg-linear-to-r from-indigo-300 via-[#7C74FF] to-indigo-400 bg-clip-text text-transparent">
              Grow Your{" "}
              <span className="relative inline-block">
                Business.
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-[#6C63FF]/80"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 9 C 60 2, 140 2, 198 7" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-3xl text-center text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8"
        >
          আপনার ব্যবসার জন্য ready-made software,{" "}
          <span className="font-semibold text-neutral-200">সহজ subscription-এ</span>। Hotel booking থেকে শুরু করে
          e-commerce, hotel room booking ও turf reservation—সবকিছু এক জায়গায় explore করুন।
        </motion.p>

        <motion.div variants={item} className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="#solutions"
            className="group inline-flex h-13 items-center gap-2 rounded-xl bg-[#3D2EF9] px-7 text-base font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_18px_40px_-10px_rgba(61,46,249,0.7)] transition hover:-translate-y-0.5 hover:bg-[#4d3ffa] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14)_inset,0_24px_48px_-10px_rgba(61,46,249,0.85)]"
          >
            Explore Products
            <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="#work"
            className="glass inline-flex h-13 items-center gap-2 rounded-xl px-7 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
          >
            View Live Demos
          </Link>
        </motion.div>

        {/* project showcase — fanned browser frames that bleed into the next section */}
        <motion.div variants={item} className="relative mx-auto mt-10 min-h-0 w-full max-w-6xl flex-1 md:mt-12">
          <div className="agency-blob-pulse pointer-events-none absolute top-1/3 left-1/2 h-72 w-[70%] -translate-x-1/2 rounded-full bg-white/[0.08] blur-[110px]" />

          <div className="relative h-full">
            <div className="absolute top-12 left-0 hidden w-[44%] origin-bottom-right -rotate-6 opacity-80 md:block">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <BrowserFrame
                  title="tripwave.com — Hotel & Resort Booking"
                  src="/hotel-management.webp"
                  className="border-white/10 shadow-2xl shadow-black/50"
                />
              </motion.div>
            </div>
            <div className="absolute top-12 right-0 hidden w-[44%] origin-bottom-left rotate-6 opacity-80 md:block">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              >
                <BrowserFrame
                  title="fitstorebd.com — Product Page"
                  src="/ecommerce-product.webp"
                  className="border-white/10 shadow-2xl shadow-black/50"
                />
              </motion.div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-1/2 z-10 w-full -translate-x-1/2 md:w-[60%]"
            >
              <BrowserFrame
                title="fitstorebd.com — Online Shop"
                src="/ecommerce.webp"
                className="border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/20"
              />

              <span className="glass-strong absolute -top-4 left-4 flex items-center gap-2 rounded-full bg-black/40 px-3.5 py-1.5 text-xs font-semibold text-white sm:-left-6">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                Real Client Projects
              </span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* fade the showcase out into the section below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
    </section>
  );
}
