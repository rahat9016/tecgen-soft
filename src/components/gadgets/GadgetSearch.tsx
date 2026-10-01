"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { formatTaka } from "@/src/data/gadgets";
import { useGadgetDB } from "@/src/lib/gadget-store/store";
import { cn } from "@/src/lib/utils";

const MAX_RESULTS = 8;

export default function GadgetSearch({
  placeholder = "Search iPhone, AirPods, power bank...",
  className,
  dark = false,
}: {
  placeholder?: string;
  className?: string;
  dark?: boolean;
}) {
  const router = useRouter();
  const { products } = useGadgetDB();
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return products
      .filter((g) => {
        if (!g.active) return false;
        const haystack = `${g.name} ${g.brand} ${g.category}`.toLowerCase();
        return words.every((w) => haystack.includes(w));
      })
      .slice(0, MAX_RESULTS);
  }, [query, products]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const goTo = (slug: string) => {
    setOpen(false);
    setQuery("");
    setActive(-1);
    router.push(`/gadgets/product/${slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (results.length ? (i + 1) % results.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = results[active] ?? results[0];
    if (target) goTo(target.slug);
  };

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <form role="search" onSubmit={onSubmit}>
        <div
          className={cn(
            "flex h-12 items-center rounded-full border px-5 transition focus-within:border-orange-400",
            dark
              ? "border-white/10 bg-white/10 text-white focus-within:bg-white/15"
              : "border-transparent bg-neutral-100 focus-within:bg-white focus-within:shadow-sm"
          )}
        >
          <Search className={cn("size-5 shrink-0", dark ? "text-neutral-300" : "text-neutral-400")} />
          <input
            type="text"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="h-full w-full bg-transparent px-3 text-sm outline-none placeholder:text-neutral-400"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setActive(-1);
              }}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                dark
                  ? "text-neutral-300 hover:bg-white/10 hover:text-white"
                  : "text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
              )}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl">
          {results.length ? (
            <ul id={listId} role="listbox" className="max-h-[420px] overflow-y-auto py-2">
              {results.map((item, i) => (
                <li key={item.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={`/gadgets/product/${item.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(item.slug);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 transition",
                      i === active ? "bg-orange-50" : "hover:bg-neutral-50"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt=""
                      className="size-12 shrink-0 rounded-lg bg-neutral-50 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-800">{item.name}</p>
                      <p className="text-xs text-neutral-400">
                        {item.brand} · {item.category}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-orange-500">{formatTaka(item.price)}</p>
                      {item.originalPrice && (
                        <p className="text-[11px] text-neutral-400 line-through">
                          {formatTaka(item.originalPrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">
              No gadgets found for “{query.trim()}”
            </p>
          )}
        </div>
      )}
    </div>
  );
}
