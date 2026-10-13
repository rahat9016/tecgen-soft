"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

export default function BrowserFrame({
  title,
  src,
  badge,
  className,
  imageClassName,
  scroll,
}: {
  title: string;
  src: string;
  badge?: ReactNode;
  className?: string;
  imageClassName?: string;
  /** Auto-scroll a full-page screenshot inside the frame; value is the one-way duration in seconds. */
  scroll?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] shadow-xl shadow-black/30 backdrop-blur-xl ${className ?? ""}`}
    >
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.06] px-4 py-3">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-white/30" />
          <span className="size-2.5 rounded-full bg-white/30" />
          <span className="size-2.5 rounded-full bg-white/30" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-center text-[10px] text-white/60">
          {title}
        </div>
        {badge && <span className="shrink-0">{badge}</span>}
      </div>
      {scroll ? (
        <div className={`relative aspect-16/10 w-full overflow-hidden ${imageClassName ?? ""}`}>
          {/* top: 0→100% of the frame, y: 0→-100% of the image — lands exactly on the page bottom */}
          <motion.div
            className="absolute inset-x-0"
            animate={
              reduceMotion ? undefined : { top: ["0%", "0%", "100%", "100%"], y: ["0%", "0%", "-100%", "-100%"] }
            }
            transition={{
              duration: scroll,
              times: [0, 0.08, 0.92, 1],
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Image
              src={src}
              alt={title}
              width={0}
              height={0}
              sizes="(min-width: 768px) 60vw, 100vw"
              className="h-auto w-full"
            />
          </motion.div>
        </div>
      ) : (
        <div className={`relative aspect-16/10 w-full ${imageClassName ?? ""}`}>
          <Image src={src} alt={title} fill className="object-cover object-top" />
        </div>
      )}
    </div>
  );
}
