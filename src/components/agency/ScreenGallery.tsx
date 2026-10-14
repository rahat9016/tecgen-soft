"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutDashboard, Store } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { Screen } from "@/src/lib/solutions";

const groups = [
  { key: "customer", label: "Customer website", short: "Customer", icon: Store },
  { key: "admin", label: "Admin panel", short: "Admin", icon: LayoutDashboard },
] as const;

/** Every page of the demo — pick customer side or admin side, then step through the screens. */
export default function ScreenGallery({ screens, name }: { screens: Screen[]; name: string }) {
  const available = groups.filter((g) => screens.some((s) => s.group === g.key));
  const [group, setGroup] = useState<Screen["group"]>(available[0]?.key ?? "customer");
  const [index, setIndex] = useState(0);

  const list = screens.filter((s) => s.group === group);
  const current = list[index];
  if (!current) return null;

  const go = (step: number) => setIndex((i) => (i + step + list.length) % list.length);
  const switchGroup = (key: Screen["group"]) => {
    setGroup(key);
    setIndex(0);
  };

  return (
    <div>
      {available.length > 1 && (
        <div className="flex justify-center">
          <div className="glass inline-flex gap-1 rounded-full p-1">
            {available.map(({ key, label, short, icon: Icon }) => {
              const active = key === group;
              const count = screens.filter((s) => s.group === key).length;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchGroup(key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition sm:px-5 ${
                    active ? "bg-white text-[#0a0a0a]" : "text-neutral-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{label}</span>
                  <span
                    className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                      active ? "bg-black/10 text-neutral-700" : "bg-white/10 text-neutral-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-[280px_1fr] lg:gap-8">
        {/* screen picker — a scroll row on mobile, a list beside the frame on desktop */}
        <ul className="order-2 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:order-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {list.map((s, i) => {
            const active = i === index;
            return (
              <li key={s.src} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setIndex(i)}
                  className={`flex w-52 items-center gap-3 rounded-xl border p-2 text-left transition lg:w-full ${
                    active
                      ? "border-indigo-300/35 bg-white/8"
                      : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/6"
                  }`}
                >
                  <span className="relative aspect-16/10 w-16 shrink-0 overflow-hidden rounded-md border border-white/10">
                    <Image src={s.src} alt="" fill sizes="64px" className="object-cover object-top" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] text-neutral-500 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`block truncate text-sm font-medium ${active ? "text-white" : "text-neutral-300"}`}
                    >
                      {s.title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="order-1 min-w-0 lg:order-2">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/6 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)] backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/6 px-4 py-3">
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-white/30" />
                <span className="size-2.5 rounded-full bg-white/30" />
                <span className="size-2.5 rounded-full bg-white/30" />
              </div>
              <div className="min-w-0 flex-1 truncate rounded-full border border-white/10 bg-white/6 px-3 py-1 text-center text-[11px] text-white/60">
                {name} · {current.title}
              </div>
            </div>

            <div className="relative aspect-16/10 w-full bg-neutral-900">
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.src}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.src}
                    alt={`${name} — ${current.title}`}
                    fill
                    sizes="(min-width: 1280px) 900px, (min-width: 1024px) 70vw, 100vw"
                    className="object-cover object-top brightness-95"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-4 px-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-500 tabular-nums">
                {index + 1} / {list.length}
              </p>
              <h3 className="mt-0.5 text-base font-semibold text-white">{current.title}</h3>
              <p className="text-bn mt-0.5 text-[15px] text-neutral-400">{current.desc}</p>
            </div>
            {list.length > 1 && (
              <div className="flex shrink-0 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous screen"
                  className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/6 text-white transition hover:border-white/25 hover:bg-white/12"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next screen"
                  className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/6 text-white transition hover:border-white/25 hover:bg-white/12"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
