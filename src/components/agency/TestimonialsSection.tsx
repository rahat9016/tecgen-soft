import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";

// No real client testimonials yet. Per trust policy, never fabricate quotes —
// swap this back to real testimonials once genuine ones are available.
export default function TestimonialsSection() {
  return (
    <section className="relative py-14 md:py-18">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.06] blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="glass rounded-3xl px-6 py-10 text-center sm:px-12 sm:py-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            See Our Real Work
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-neutral-400">
            আমরা এখনো client testimonial জমা করছি — fake review দেখানোর চেয়ে আমরা আমাদের
            real product ও demo আপনাকে সরাসরি দেখাতে চাই।
          </p>
          <Link
            href="#work"
            className="mt-6 inline-flex h-11 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.12]"
          >
            Our Work দেখুন
            <ArrowRight className="size-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
