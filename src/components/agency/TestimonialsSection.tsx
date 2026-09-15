import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";

// No real client testimonials yet. Per trust policy, never fabricate quotes —
// swap this back to real testimonials once genuine ones are available.
export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
      <Reveal>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          See Our Real Work
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
          আমরা এখনো client testimonial জমা করছি — fake review দেখানোর চেয়ে আমরা আমাদের
          real product ও demo আপনাকে সরাসরি দেখাতে চাই।
        </p>
        <Link
          href="#work"
          className="mt-6 inline-flex h-11 items-center gap-1.5 rounded-lg bg-indigo-50 px-5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          Our Work দেখুন
          <ArrowRight className="size-3.5" />
        </Link>
      </Reveal>
    </section>
  );
}
