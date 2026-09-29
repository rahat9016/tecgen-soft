"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import Image from "next/image";
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
      className="relative flex h-[calc(100svh-4rem)] min-h-[580px] flex-col overflow-hidden bg-[#061531]"
    >
      {/* professional background photo */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 h-[calc(100%+120px)] w-full">
        <Image
          src="/background.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          aria-hidden="true"
        />
      </motion.div>

      {/* brand-color overlay for legibility + depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(6,21,49,0.88) 0%, rgba(6,21,49,0.75) 32%, rgba(6,21,49,0.4) 58%, rgba(6,21,49,0.25) 100%), radial-gradient(ellipse 60% 50% at 10% 110%, rgba(61,46,249,0.3), transparent 60%)",
        }}
      />

      {/* fine grain texture for a premium, non-flat feel */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden="true">
        <filter id="agency-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#agency-noise)" />
      </svg>

      {/* faint grid, faded out toward the edges */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ y: contentY, opacity: heroOpacity }}
        className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 pt-[7vh] sm:px-6 lg:px-8"
      >
        <motion.h1
          variants={item}
          className="mx-auto max-w-6xl text-center text-[2.5rem] leading-[1.2] font-bold tracking-tight text-white sm:text-6xl lg:text-[4rem] xl:text-[4.25rem]"
        >
          <span className="block">আপনার ব্যবসার জন্য</span>
          <span className="mt-2 block">
            <span className="bg-linear-to-r from-indigo-300 via-[#7C74FF] to-indigo-400 bg-clip-text text-transparent">
              Professional{" "}
              <span className="relative inline-block">
                Website
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-[#6C63FF]/80"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 9 C 60 2, 140 2, 198 7" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </span>{" "}
            <span className="whitespace-nowrap">তৈরি করুন</span>
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-7 max-w-2xl text-center text-base leading-7 text-slate-400 sm:text-lg sm:leading-8"
        >
          Your dependable digital partner — delivering{" "}
          <span className="font-semibold text-slate-200">end-to-end web solutions</span> with absolute transparency
          and long-term support.
        </motion.p>

        {/* project showcase — fanned browser frames that bleed into the next section */}
        <motion.div variants={item} className="relative mx-auto mt-12 min-h-0 w-full max-w-6xl flex-1 md:mt-14">
          <div className="agency-blob-pulse pointer-events-none absolute top-1/3 left-1/2 h-72 w-[70%] -translate-x-1/2 rounded-full bg-[#3D2EF9]/35 blur-[110px]" />

          <div className="relative h-full">
            <div className="absolute top-12 left-0 hidden w-[44%] origin-bottom-right -rotate-6 opacity-80 md:block">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <BrowserFrame
                  title="tripwave.com — Hotel & Resort Booking"
                  src="/hotel-management.webp"
                  scroll={20}
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
                scroll={22}
                className="border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/20"
              />

              <span className="absolute -top-4 left-4 flex items-center gap-2 rounded-full border border-white/15 bg-[#0b1d42]/85 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-black/30 backdrop-blur-md sm:-left-6">
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-linear-to-t from-[#061531] via-[#061531]/80 to-transparent" />
    </section>
  );
}
