"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

type Feature = { title: string; desc: string };

/** Feature list beside a browser frame whose full-page screenshot scrolls along as the reader moves down the list. */
export default function FeatureShowcase({
  features,
  pageSrc,
  title,
}: {
  features: Feature[];
  pageSrc: string;
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 65%"] });

  // top: 0→100% of the frame, y: 0→-100% of the image — the page bottom lands exactly on the frame bottom
  const top = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(features.length - 1, Math.max(0, Math.floor(v * features.length))));
  });

  return (
    <div ref={ref} className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
      <ol className="order-2 space-y-3 lg:order-1">
        {features.map((f, i) => {
          const isActive = i === active;
          return (
            <li
              key={f.title}
              className={`glass rounded-2xl p-5 transition duration-300 sm:p-6 ${
                isActive ? "border-indigo-300/30 bg-white/7" : ""
              }`}
            >
              <div className="flex gap-4">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold tabular-nums transition duration-300 ${
                    isActive
                      ? "border-[#3D2EF9]/40 bg-[#3D2EF9]/25 text-indigo-100"
                      : "border-white/10 bg-white/4 text-neutral-400"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 pt-1">
                  <h3 className="text-base font-semibold text-white">{f.title}</h3>
                  <p className="text-bn mt-1 text-[15px] text-neutral-400">{f.desc}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="order-1 lg:order-2">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/6 shadow-xl shadow-black/40 backdrop-blur-xl">
          <div className="relative flex shrink-0 items-center gap-3 border-b border-white/10 bg-white/6 px-4 py-3">
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-white/30" />
              <span className="size-2.5 rounded-full bg-white/30" />
              <span className="size-2.5 rounded-full bg-white/30" />
            </div>
            <div className="min-w-0 flex-1 truncate rounded-full border border-white/10 bg-white/6 px-3 py-1 text-center text-[11px] text-white/60">
              {title}
            </div>
            {/* reading progress through the feature list */}
            <motion.span
              style={{ scaleX: scrollYProgress }}
              className="absolute inset-x-0 bottom-0 h-px origin-left bg-linear-to-r from-indigo-400/0 via-indigo-300/70 to-indigo-300/0"
            />
          </div>
          {/* desktop: stretch to the feature list beside it; never shorter than the min height */}
          <div className="relative aspect-16/10 min-h-60 w-full overflow-hidden lg:aspect-auto lg:min-h-105 lg:flex-1">
            <motion.div style={{ top, y }} className="absolute inset-x-0">
              <Image
                src={pageSrc}
                alt={`${title} — full page`}
                width={0}
                height={0}
                sizes="(min-width: 1024px) 640px, 100vw"
                className="h-auto w-full brightness-95"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
