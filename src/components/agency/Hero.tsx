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
    <section ref={sectionRef} className="relative overflow-hidden bg-indigo-50/40">
      <motion.svg
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0 h-[calc(100%+120px)] w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="agency-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#c7d2fe" strokeWidth="1" opacity="0.5" />
          </pattern>
          <radialGradient id="agency-fade" cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#eef2ff" stopOpacity="0" />
            <stop offset="70%" stopColor="#eef2ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </radialGradient>
          <filter id="agency-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="70" />
          </filter>
        </defs>
        <g className="agency-grid-drift">
          <rect x="-64" y="-64" width="1728" height="1028" fill="url(#agency-grid)" />
        </g>
        <circle
          className="agency-blob-pulse"
          cx="1380"
          cy="40"
          r="180"
          fill="#6366f1"
          opacity="0.22"
          filter="url(#agency-blur)"
        />
        <circle
          className="agency-blob-pulse agency-blob-pulse-delayed"
          cx="60"
          cy="760"
          r="200"
          fill="#3b82f6"
          opacity="0.18"
          filter="url(#agency-blur)"
        />
        <rect width="1600" height="900" fill="url(#agency-fade)" />
      </motion.svg>

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
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700"
          >
            🇧🇩 বাংলাদেশি উদ্যোক্তাদের জন্য তৈরি
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl"
          >
            আপনার ব্যবসার জন্য{" "}
            <span className="text-indigo-600">Professional Website</span> —
            আপনার বাজেটের মধ্যেই।
          </motion.h1>
          <motion.p variants={item} className="mt-3 text-base font-medium text-slate-500 sm:text-lg">
            Launch Your Business Online Without Breaking Your Budget.
          </motion.p>

          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base"
          >
            E-commerce, Hotel Booking, Restaurant, Business Website এবং আরও অনেক কিছু —
            আমরা আপনার ব্যবসার প্রয়োজন অনুযায়ী <strong>ready-to-launch website</strong> তৈরি
            করি। টেকনোলজি বুঝতে হবে না — সেই দায়িত্ব আমাদের।
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#solutions"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30"
            >
              View Our Solutions
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <MessageCircle className="size-4" />
              Talk to Us
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {trustIndicators.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Icon className="size-3.5 text-indigo-600" />
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
            <BrowserFrame title="tripwave.com — Hotel & Resort Booking" src="/agency/preview-hotel.jpg" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-8 -left-2 w-[62%] sm:-bottom-10"
          >
            <BrowserFrame
              title="fitstorebd.com — Online Shop"
              src="/agency/preview-ecommerce.jpg"
              className="ring-4 ring-white"
            />
          </motion.div>
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-3 -left-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-indigo-600 shadow-md"
          >
            Real Client Projects
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
}
