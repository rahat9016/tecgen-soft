import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Hotel, Shirt, Smartphone, type LucideIcon } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";
import { SOLUTIONS } from "@/src/lib/solutions";

const HOVER_FLAT = "lg:group-hover:[transform:perspective(1400px)_rotateY(0deg)_translateY(-10px)]";

// per-product look — frames lean in toward the centre of the row on large screens
const showcase: Record<
  string,
  { icon: LucideIcon; lines: [string, string]; chip: string; arrow: string; glow: string; tilt: string }
> = {
  "hotel-booking": {
    icon: Hotel,
    lines: ["Hotel Booking", "Management"],
    chip: "bg-indigo-500",
    arrow: "text-indigo-400",
    glow: "bg-indigo-500/80",
    tilt: "lg:[transform:perspective(1400px)_rotateY(16deg)]",
  },
  "gadget-ecommerce": {
    icon: Smartphone,
    lines: ["Gadget", "E-commerce"],
    chip: "bg-teal-500",
    arrow: "text-teal-400",
    glow: "bg-teal-400/70",
    tilt: "lg:[transform:perspective(1400px)_rotateY(7deg)]",
  },
  ecommerce: {
    icon: Shirt,
    lines: ["Fashion", "E-commerce"],
    chip: "bg-fuchsia-600",
    arrow: "text-fuchsia-400",
    glow: "bg-fuchsia-500/75",
    tilt: "lg:[transform:perspective(1400px)_rotateY(-7deg)]",
  },
  "turf-booking": {
    icon: CalendarCheck,
    lines: ["Turf", "Booking"],
    chip: "bg-emerald-500",
    arrow: "text-emerald-400",
    glow: "bg-emerald-400/70",
    tilt: "lg:[transform:perspective(1400px)_rotateY(-16deg)]",
  },
};

export default function PortfolioSection() {
  const products = SOLUTIONS.filter((s) => s.demoHref && showcase[s.slug]);

  return (
    <section id="work" className="relative py-10 sm:py-14 md:py-20">
      <div className="pointer-events-none absolute top-1/3 -left-40 size-112 rounded-full bg-white/6 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-white/4 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            আপনার ব্যবসার জন্য{" "}
            <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
              সেরা ওয়েবসাইট
            </span>{" "}
            বেছে নিন
          </h2>
          <p className="mt-3 text-base text-neutral-400">
            যেকোনো ধরনের বিজনেসের জন্য আমাদের কাছে রয়েছে আকর্ষণীয় ও রেডিমেড ওয়েবসাইট সমাধান।
          </p>
        </Reveal>

        <StaggerGrid className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:mt-12 sm:gap-y-12 lg:mt-16 lg:grid-cols-4 lg:gap-x-6">
          {products.map(({ slug, name, demoHref }) => {
            const { icon: Icon, lines, chip, arrow, glow, tilt } = showcase[slug];
            return (
              <StaggerItem key={slug} className="group">
                <Link href={demoHref!} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="flex items-center justify-center gap-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${chip} text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_10px_24px_-8px_rgba(0,0,0,0.7)]`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="text-sm leading-snug font-medium text-white sm:text-base">
                      {lines[0]}
                      <br />
                      {lines[1]}
                    </span>
                  </div>

                  <svg
                    className={`mx-auto mt-2 h-7 w-4 ${arrow}`}
                    viewBox="0 0 16 28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M8 2c5 5-5 10 0 15v8" />
                    <path d="m4.5 21.5 3.5 3.5 3.5-3.5" />
                  </svg>

                  <div className="relative mt-3">
                    {/* coloured floor glow under the screen */}
                    <div className={`pointer-events-none absolute inset-x-2 -bottom-10 h-24 rounded-full ${glow} blur-3xl`} />
                    <div className={`pointer-events-none absolute inset-x-10 -bottom-3 h-6 rounded-full ${glow} blur-lg`} />

                    <div
                      className={`relative overflow-hidden rounded-xl border border-white/15 bg-neutral-900 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)] transition-transform duration-500 ${tilt} ${HOVER_FLAT}`}
                    >
                      <div className="flex items-center gap-1.5 border-b border-white/10 bg-neutral-800/90 px-3 py-2">
                        <span className="size-2 rounded-full bg-red-400" />
                        <span className="size-2 rounded-full bg-amber-400" />
                        <span className="size-2 rounded-full bg-emerald-400" />
                      </div>
                      {/* full-page capture — hovering scrolls through the site */}
                      <div className="relative aspect-3/4">
                        <Image
                          src={`/solutions/${slug}-page.webp`}
                          alt={`${name} — live demo`}
                          fill
                          sizes="(min-width: 1024px) 290px, 45vw"
                          className="object-cover object-top transition-[object-position] duration-4000 ease-in-out group-hover:object-bottom"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </div>
    </section>
  );
}
