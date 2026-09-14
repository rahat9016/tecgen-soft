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

        const anchors = Array.from(
          document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
        ).filter((a) => a.getAttribute("href")!.length > 1);

        const handleClick = (e: MouseEvent, anchor: HTMLAnchorElement) => {
          e.preventDefault();
          smoother?.scrollTo(anchor.getAttribute("href")!, true, "top 64px");
        };

        const listeners = anchors.map((anchor) => {
          const fn = (e: MouseEvent) => handleClick(e, anchor);
          anchor.addEventListener("click", fn);
          return { anchor, fn };
        });

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
