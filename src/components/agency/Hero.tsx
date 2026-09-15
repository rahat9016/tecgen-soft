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

function BrowserFrame({
  title,
  src,
  className,
}: {
  title: string;
  src: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ${className ?? ""}`}
    >
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="size-2 rounded-full bg-red-300" />
        <span className="size-2 rounded-full bg-amber-300" />
        <span className="size-2 rounded-full bg-emerald-300" />
        <span className="ml-2 truncate text-[10px] text-slate-400">{title}</span>
      </div>
      <div className="relative aspect-16/10 w-full">
        <Image src={src} alt={title} fill className="object-cover object-top" />
      </div>
    </div>
  );
}

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
        className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:items-center lg:px-8"
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
            className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            আপনার ব্যবসার জন্য{" "}
            <span className="bg-linear-to-r from-indigo-400 via-[#6C63FF] to-indigo-300 bg-clip-text text-transparent">
              Professional Website
            </span>{" "}
            — আপনার বাজেটের মধ্যেই।
          </motion.h1>
          <motion.p variants={item} className="mt-3 text-base font-medium text-slate-300 sm:text-lg">
            Launch Your Business Online Without Breaking Your Budget.
          </motion.p>

          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base"
          >
            E-commerce, Hotel Booking, Restaurant, Business Website এবং আরও অনেক কিছু —
            আমরা আপনার ব্যবসার প্রয়োজন অনুযায়ী{" "}
            <strong className="font-semibold text-slate-200">ready-to-launch website</strong> তৈরি
            করি। টেকনোলজি বুঝতে হবে না — সেই দায়িত্ব আমাদের।
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#solutions"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#3D2EF9] px-6 text-sm font-semibold text-white shadow-lg shadow-[#3D2EF9]/30 transition hover:bg-[#4d3ffa] hover:shadow-xl hover:shadow-[#3D2EF9]/40"
            >
              View Our Solutions
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
            >
              <MessageCircle className="size-4" />
              Talk to Us
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
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
          className="relative mx-auto w-full max-w-md pb-12 lg:max-w-none"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="ml-auto w-[85%]"
          >
            <BrowserFrame title="tripwave.com — Hotel & Resort Booking" src="/hotel-management.webp" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-8 -left-2 w-[62%] sm:-bottom-10"
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
            className="absolute top-3 -left-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#3D2EF9] shadow-lg shadow-black/20"
          >
            Real Client Projects
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
}
