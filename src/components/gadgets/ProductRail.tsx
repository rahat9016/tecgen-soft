"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Gadget } from "@/src/data/gadgets";
import { cn } from "@/src/lib/utils";
import GadgetCard from "./GadgetCard";
import SectionTitle from "./SectionTitle";

type Tab = { label: string; items: Gadget[] };

export default function ProductRail({
  id,
  title,
  highlight,
  items,
  tabs,
}: {
  id?: string;
  title: string;
  highlight: string;
  items?: Gadget[];
  tabs?: Tab[];
}) {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const list = tabs ? tabs[active].items : (items ?? []);

  const scroll = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild?.clientWidth ?? 200;
    el.scrollBy({ left: dir * (card + 16) * 2, behavior: "smooth" });
  };

  const selectTab = (i: number) => {
    setActive(i);
    scrollerRef.current?.scrollTo({ left: 0 });
  };

  return (
    <section id={id} className="container mt-14 scroll-mt-32">
      <div className="flex items-center justify-between gap-4">
        <SectionTitle title={title} highlight={highlight} />
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:border-orange-500 hover:text-orange-500"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="flex size-8 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-orange-500"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {tabs && (
        <div role="tablist" className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              role="tab"
              aria-selected={i === active}
              onClick={() => selectTab(i)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition",
                i === active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-orange-400 hover:text-orange-500"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div
        ref={scrollerRef}
        className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {list.map((item) => (
          <div key={item.id} className="w-[44vw] shrink-0 snap-start sm:w-[210px]">
            <GadgetCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
