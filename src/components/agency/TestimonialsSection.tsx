import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";

const screens = ["hotel-booking", "gadget-ecommerce", "ecommerce", "turf-booking"];
// three rows, each starting on a different product so the wall doesn't look tiled
const wall = [0, 1, 2].flatMap((row) => screens.map((_, i) => screens[(i + row) % screens.length]));

// No real client testimonials yet. Per trust policy, never fabricate quotes —
// this banner points people at the live demos instead; swap in real testimonials once they exist.
export default function TestimonialsSection() {
  return (
    <section className="relative py-10 sm:py-14 md:py-18">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="glass relative overflow-hidden rounded-3xl px-5 py-10 text-center sm:px-12 sm:py-20">
          {/* backdrop: a tilted wall of the real product screens, darkened toward the centre */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -inset-x-1/4 -inset-y-full grid -rotate-8 grid-cols-4 content-center gap-4 opacity-45">
              {wall.map((slug, i) => (
                <div key={i} className="relative aspect-16/10 overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={`/solutions/${slug}-desktop.webp`}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 420px, 40vw"
                    className="object-cover object-top"
                  />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_75%_at_50%_50%,rgba(10,10,10,0.94)_30%,rgba(10,10,10,0.55))]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_50%_120%,rgba(61,46,249,0.35),transparent_70%)]" />
          </div>

          <div className="relative">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-neutral-200">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              ৪টি product · live demo
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Try It Before You{" "}
              <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
                Subscribe
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-300">
              Review পড়ার চেয়ে নিজে ব্যবহার করে দেখা ভালো — hotel, gadget, fashion ও turf, চারটি product-এরই live
              demo খোলা আছে। চালিয়ে দেখুন, তারপর সিদ্ধান্ত নিন।
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="#work"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-[#3D2EF9] px-6 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_14px_32px_-10px_rgba(61,46,249,0.8)] transition hover:-translate-y-0.5 hover:bg-[#4d3ffa]"
              >
                Live Demos দেখুন
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#contact"
                className="glass inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
              >
                <MessageCircle className="size-4" />
                Get a Quote
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
