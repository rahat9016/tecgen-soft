"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Hotel, MousePointer2, Play, ShoppingBag } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { PROJECTS, type Project } from "@/src/lib/projects";

const categoryIcon: Record<string, typeof ShoppingBag> = {
  "E-commerce": ShoppingBag,
  "Hotel Booking": Hotel,
};

function FrameBar({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.06] px-4 py-2.5">
      <div className="flex shrink-0 gap-1.5">
        <span className="size-2.5 rounded-full bg-white/30" />
        <span className="size-2.5 rounded-full bg-white/30" />
        <span className="size-2.5 rounded-full bg-white/30" />
      </div>
      <div className="min-w-0 flex-1 truncate rounded-full border border-white/10 bg-white/[0.06] px-3 py-0.5 text-center text-[10px] text-white/60">
        {title}
      </div>
    </div>
  );
}

/** Full-page screenshot that scrolls to the bottom while hovered (or tapped) — lets visitors "browse" the site. */
function ScrollPreview({ project }: { project: Project }) {
  const page = project.gallery[0];
  const [scrolling, setScrolling] = useState(false);
  const transition = "top 7s ease-in-out, transform 7s ease-in-out";

  return (
    <div
      onMouseEnter={() => setScrolling(true)}
      onMouseLeave={() => setScrolling(false)}
      onClick={() => setScrolling((v) => !v)}
      className="cursor-ns-resize overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] shadow-2xl shadow-black/40 backdrop-blur-xl"
    >
      <FrameBar title={project.name} />
      <div className="relative aspect-16/10 overflow-hidden">
        <Image
          src={page.image}
          alt={`${project.name} — ${page.label}`}
          width={page.width}
          height={page.height}
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="absolute inset-x-0 h-auto w-full"
          style={{
            top: scrolling ? "100%" : "0%",
            transform: scrolling ? "translateY(-100%)" : "translateY(0)",
            transition,
          }}
        />
        <span
          className={`pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-neutral-900/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md transition-opacity ${
            scrolling ? "opacity-0" : "opacity-100"
          }`}
        >
          <MousePointer2 className="size-3" />
          <span className="hidden lg:inline">Hover to scroll</span>
          <span className="lg:hidden">Tap to scroll</span>
        </span>
      </div>
    </div>
  );
}

export default function PortfolioSection() {
  const [active, setActive] = useState(0);
  const project = PROJECTS[active];
  const secondary = project.gallery[1];

  return (
    <section id="work" className="relative py-14 md:py-20">
      <div className="pointer-events-none absolute top-1/4 -left-40 size-[28rem] rounded-full bg-white/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-white/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Explore Our{" "}
            <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
              Live Work
            </span>
          </h2>
          <p className="mt-3 text-base text-neutral-400">
            Every project below is real and clickable — not a mockup.
          </p>
        </Reveal>

        {/* project switcher */}
        <Reveal delay={0.05} className="mt-10 flex justify-center">
          <div role="tablist" className="glass inline-flex gap-1 rounded-2xl p-1.5">
            {PROJECTS.map((p, i) => {
              const Icon = categoryIcon[p.category] ?? ShoppingBag;
              const selected = i === active;
              return (
                <button
                  key={p.slug}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(i)}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:px-5 ${
                    selected ? "text-white" : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="work-tab"
                      className="absolute inset-0 rounded-xl bg-[#3D2EF9] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_24px_-6px_rgba(61,46,249,0.8)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <Icon className="relative size-4" />
                  <span className="relative">{p.name}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="glass mt-8 overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="grid lg:grid-cols-[1.35fr_1fr]"
            >
              {/* stage */}
              <div className="relative overflow-hidden border-b border-white/10 bg-black/40 px-5 pt-8 pb-14 sm:px-10 sm:pt-12 sm:pb-20 lg:border-r lg:border-b-0">
                <div className="pointer-events-none absolute -top-20 left-1/3 size-96 rounded-full bg-white/[0.08] blur-[110px]" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                <div className="relative">
                  <ScrollPreview project={project} />

                  {secondary && (
                    <Link
                      href={secondary.href}
                      className="group/sec absolute -right-2 -bottom-10 hidden w-[42%] overflow-hidden rounded-lg border border-white/20 bg-black/50 shadow-2xl shadow-black/50 backdrop-blur-xl transition hover:-translate-y-1 sm:block sm:-right-4 sm:-bottom-14"
                    >
                      <FrameBar title={secondary.label} />
                      <div className="relative aspect-16/10">
                        <Image
                          src={secondary.image}
                          alt={`${project.name} — ${secondary.label}`}
                          fill
                          sizes="20vw"
                          className="object-cover object-top"
                        />
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* details */}
              <div className="flex flex-col p-7 sm:p-10">
                <span className="inline-flex w-fit items-center rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-200 uppercase">
                  {project.category}
                </span>
                <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{project.name}</h3>
                <p className="mt-3 text-base leading-relaxed text-neutral-400">{project.description}</p>

                {project.journey && (
                  <div className="mt-7">
                    <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">User Journey</p>
                    <ol className="mt-3 space-y-2">
                      {project.journey.map((step, i) => (
                        <motion.li
                          key={step}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.07 }}
                          className="flex items-center gap-3 text-sm text-neutral-200"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-indigo-300/25 bg-indigo-400/15 text-[11px] font-bold text-indigo-200">
                            {i + 1}
                          </span>
                          {step}
                        </motion.li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-2.5 lg:mt-auto lg:pt-8">
                  <Link
                    href={project.liveHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#3D2EF9] px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_12px_30px_-8px_rgba(61,46,249,0.75)] transition hover:-translate-y-0.5 hover:bg-[#4d3ffa]"
                  >
                    <Play className="size-3.5 fill-current" />
                    Live Preview দেখুন
                  </Link>
                  <Link
                    href={`/work/${project.slug}`}
                    className="group inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-neutral-200 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                  >
                    Case Study
                    <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
