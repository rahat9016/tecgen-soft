import { Star } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

// TODO: replace with real client quotes only — do not invent names/businesses.
// A fabricated quote presented as a real customer is a trust risk, not a trust builder.
const testimonials: {
  quote: string;
  name: string;
  business: string;
}[] = [
  {
    quote: "Client quote goes here.",
    name: "Client Name",
    business: "Business Name",
  },
  {
    quote: "Client quote goes here.",
    name: "Client Name",
    business: "Business Name",
  },
  {
    quote: "Client quote goes here.",
    name: "Client Name",
    business: "Business Name",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          আমাদের ক্লায়েন্টরা যা বলছেন
        </h2>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">What Our Clients Say</p>
      </Reveal>

      <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <StaggerItem
            key={i}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="size-3.5 fill-current" />
              ))}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">“{t.quote}”</p>
            <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                {t.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.business}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </section>
  );
}
