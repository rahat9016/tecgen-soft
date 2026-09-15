"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Wallet,
  Wrench,
} from "lucide-react";

import BrowserFrame from "@/src/components/agency/BrowserFrame";

const trustIndicators = [
  { icon: Wallet, label: "স্পষ্ট মূল্য (Clear Pricing)" },
  { icon: ShieldCheck, label: "কোনো Hidden Cost নেই" },
  { icon: Smartphone, label: "Mobile Responsive" },
  { icon: BadgeCheck, label: "Admin Panel সহ" },
  { icon: Wrench, label: "After-Sales Support" },
];

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
    <section ref={sectionRef} className="relative overflow-hidden bg-[#061531]">
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

      {/* soft fade into the section below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#061531] to-transparent" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ y: contentY, opacity: heroOpacity }}
        className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-8 lg:px-8"
      >
        <div>
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur-sm"
          >
            🇧🇩 বাংলাদেশি উদ্যোক্তাদের জন্য তৈরি
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 text-[2.6rem] leading-[1.08] font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            আপনার ব্যবসার জন্য{" "}
            <span className="bg-linear-to-r from-indigo-400 via-[#6C63FF] to-indigo-300 bg-clip-text text-transparent">
              Professional Website
            </span>{" "}
            তৈরি করুন
          </motion.h1>
          <motion.p variants={item} className="mt-4 text-base font-medium text-slate-300 sm:text-lg">
            আপনার বাজেটের মধ্যেই — কোনো hidden cost ছাড়া।
          </motion.p>

          <motion.p
            variants={item}
            className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base"
          >
            E-commerce, Hotel Booking, Restaurant বা Business — যেকোনো ধরনের ব্যবসার জন্য{" "}
            <strong className="font-semibold text-slate-200">ready-to-launch website</strong>। টেকনোলজি
            বুঝতে হবে না, সেই দায়িত্ব আমাদের।
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <Link
              href="#solutions"
              className="group inline-flex h-14 items-center gap-2 rounded-xl bg-[#3D2EF9] px-7 text-base font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_40px_-8px_rgba(61,46,249,0.6)] transition hover:bg-[#4d3ffa] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_22px_48px_-8px_rgba(61,46,249,0.75)]"
            >
              View Our Solutions
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex h-14 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
            >
              <MessageCircle className="size-4" />
              Talk to Us
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 border-t border-white/10 pt-6">
            {trustIndicators.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Icon className="size-3.5 text-indigo-400" />
                {label}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={item}
          className="relative mx-auto w-full max-w-lg pt-4 pb-12 lg:max-w-none"
        >
          {/* soft floating glow behind the mockups */}
          <div className="agency-blob-pulse pointer-events-none absolute top-1/2 left-1/2 size-104 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3D2EF9]/25 blur-[90px]" />
          <div className="agency-blob-pulse agency-blob-pulse-delayed pointer-events-none absolute -bottom-10 left-4 size-64 rounded-full bg-indigo-400/20 blur-[70px]" />

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative ml-auto w-[92%]"
          >
            <BrowserFrame title="tripwave.com — Hotel & Resort Booking" src="/hotel-management.webp" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-6 -left-4 w-[68%] sm:-bottom-8"
          >
            <BrowserFrame
              title="fitstorebd.com — Online Shop"
              src="/ecommerce.webp"
              className="ring-4 ring-white"
            />
          </motion.div>
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-6 -left-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#3D2EF9] shadow-lg shadow-black/20"
          >
            Real Client Projects
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
}
