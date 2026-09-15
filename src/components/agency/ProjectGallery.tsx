"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Shot = { label: string; image: string; href: string; width: number; height: number };
type GsapModule = typeof import("gsap").default;
type FlipModule = typeof import("gsap/Flip").Flip;

const FLIP_DURATION = 0.55;
const FLIP_EASE = "power3.inOut";

export default function ProjectGallery({ shots }: { shots: Shot[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const thumbRefs = useRef(new Map<number, HTMLImageElement>());
  const overlayRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const busyRef = useRef(false);
  const gsapRef = useRef<{ gsap: GsapModule; Flip: FlipModule } | null>(null);

  // gsap + the Flip plugin only exist client-side — load once, lazily
  const loadGsap = useCallback(async () => {
    if (gsapRef.current) return gsapRef.current;
    const [{ default: gsap }, { Flip }] = await Promise.all([import("gsap"), import("gsap/Flip")]);
    gsap.registerPlugin(Flip);
    gsapRef.current = { gsap, Flip };
    return gsapRef.current;
  }, []);

  const openAt = useCallback(
    async (i: number) => {
      if (busyRef.current) return;
      const thumbEl = thumbRefs.current.get(i);
      const { gsap, Flip } = await loadGsap();
      const state = thumbEl ? Flip.getState(thumbEl) : null;

      busyRef.current = true;
      setIndex(i);

      requestAnimationFrame(() => {
        if (overlayRef.current) {
          gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
        }
        if (chromeRef.current) {
          gsap.fromTo(
            chromeRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, delay: 0.15, ease: "power2.out" },
          );
        }
        if (state && imgRef.current) {
          Flip.from(state, {
            targets: imgRef.current,
            duration: FLIP_DURATION,
            ease: FLIP_EASE,
            absolute: true,
            scale: true,
            onComplete: () => {
              busyRef.current = false;
            },
          });
        } else {
          busyRef.current = false;
        }
      });
    },
    [loadGsap],
  );

  const navigate = useCallback(
    async (nextIndex: number) => {
      if (index === null || busyRef.current) return;
      const thumbEl = thumbRefs.current.get(nextIndex);
      const { Flip } = await loadGsap();
      const state = thumbEl ? Flip.getState(thumbEl) : null;

      busyRef.current = true;
      setIndex(nextIndex);

      requestAnimationFrame(() => {
        if (state && imgRef.current) {
          Flip.from(state, {
            targets: imgRef.current,
            duration: 0.45,
            ease: FLIP_EASE,
            absolute: true,
            scale: true,
            onComplete: () => {
              busyRef.current = false;
            },
          });
        } else {
          busyRef.current = false;
        }
      });
    },
    [index, loadGsap],
  );

  const close = useCallback(async () => {
    if (index === null || busyRef.current) return;
    const thumbEl = thumbRefs.current.get(index);
    const { gsap, Flip } = await loadGsap();

    busyRef.current = true;
    setIsClosing(true);

    if (overlayRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.35, ease: "power2.in" });
    }
    if (chromeRef.current) {
      gsap.to(chromeRef.current, { opacity: 0, duration: 0.2, ease: "power2.in" });
    }

    const finish = () => {
      setIndex(null);
      setIsClosing(false);
      busyRef.current = false;
    };

    if (thumbEl && imgRef.current) {
      Flip.fit(imgRef.current, thumbEl, {
        duration: 0.45,
        ease: FLIP_EASE,
        scale: true,
        absolute: true,
        onComplete: finish,
      });
    } else if (imgRef.current) {
      gsap.to(imgRef.current, { opacity: 0, scale: 0.96, duration: 0.3, onComplete: finish });
    } else {
      finish();
    }
  }, [index, loadGsap]);

  useEffect(() => {
    if (index === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") navigate((index - 1 + shots.length) % shots.length);
      if (e.key === "ArrowRight") navigate((index + 1) % shots.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, navigate, shots.length]);

  const active = index !== null ? shots[index] : null;

  return (
    <>
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {shots.map((shot, i) => (
          <button
            key={shot.label}
            type="button"
            onClick={() => openAt(i)}
            className="group relative mb-6 block w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/15 focus:outline-none"
            style={{ breakInside: "avoid" }}
          >
            <Image
              ref={(el) => {
                if (el) thumbRefs.current.set(i, el);
                else thumbRefs.current.delete(i);
              }}
              src={shot.image}
              alt={shot.label}
              width={shot.width}
              height={shot.height}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={`h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
                index === i ? "invisible" : ""
              }`}
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/70 via-slate-900/0 to-slate-900/0 opacity-0 transition duration-300 group-hover:opacity-100" />
            <span className="absolute top-4 left-4 flex size-8 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-slate-900 backdrop-blur-sm">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Link
              href={shot.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 backdrop-blur-sm transition hover:text-indigo-600 group-hover:opacity-100"
              aria-label={`Open ${shot.label} live page`}
            >
              <ExternalLink className="size-3.5" />
            </Link>
            <p className="absolute bottom-4 left-4 text-sm font-semibold text-white opacity-0 transition duration-300 group-hover:opacity-100">
              {shot.label}
            </p>
          </button>
        ))}
      </div>

      {index !== null && active && (
        <div
          ref={overlayRef}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/92 p-4 backdrop-blur-sm sm:p-8 ${
            isClosing ? "pointer-events-none" : ""
          }`}
          style={{ opacity: 0 }}
          onClick={close}
        >
          <div ref={chromeRef} style={{ opacity: 0 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            {shots.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate((index - 1 + shots.length) % shots.length);
                  }}
                  className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate((index + 1) % shots.length);
                  }}
                  className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
                  aria-label="Next screenshot"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            <div className="mt-5 flex items-center justify-center gap-4 text-center">
              <p className="text-sm font-semibold text-white">
                {String(index + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")} —{" "}
                {active.label}
              </p>
              <Link
                href={active.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
              >
                Open Live Page
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element -- gsap Flip animates the raw element directly; next/image's wrapper interferes with Flip's transform math */}
          <img
            ref={imgRef}
            key={active.image}
            src={active.image}
            alt={active.label}
            onClick={(e) => e.stopPropagation()}
            className="order-first max-h-[75vh] w-auto max-w-[90vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
