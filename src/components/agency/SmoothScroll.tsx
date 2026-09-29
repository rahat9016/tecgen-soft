"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let smoother: { kill: () => void; scrollTo: (target: string, smooth?: boolean, position?: string) => void } | undefined;
    let cleanupClicks: (() => void) | undefined;

    (async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }, { ScrollSmoother }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("gsap/ScrollSmoother"),
        ]);
        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.2,
          smoothTouch: 0.1,
          effects: true,
        });

        // "#id" links, plus "/#id" links (shared header/footer) while we're on the home page
        const anchors = Array.from(
          document.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]')
        ).filter((a) => {
          const href = a.getAttribute("href")!;
          return href.length > 1 && (href.startsWith("#") || window.location.pathname === "/");
        });

        const handleClick = (e: MouseEvent, anchor: HTMLAnchorElement) => {
          const hash = anchor.getAttribute("href")!.replace(/^\//, "");
          if (!document.querySelector(hash)) return;
          e.preventDefault();
          smoother?.scrollTo(hash, true, "top 64px");
          history.replaceState(null, "", hash);
        };

        const listeners = anchors.map((anchor) => {
          const fn = (e: MouseEvent) => handleClick(e, anchor);
          anchor.addEventListener("click", fn);
          return { anchor, fn };
        });

        // arriving from another page via "/#id" — jump to the section once the smoother is ready
        const initialHash = window.location.hash;
        if (initialHash.length > 1 && document.querySelector(initialHash)) {
          requestAnimationFrame(() => smoother?.scrollTo(initialHash, false, "top 64px"));
        }

        cleanupClicks = () => {
          listeners.forEach(({ anchor, fn }) => anchor.removeEventListener("click", fn));
        };
      } catch (err) {
        console.error("[SmoothScroll] init failed", err);
      }
    })();

    return () => {
      cleanupClicks?.();
      smoother?.kill();
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}
