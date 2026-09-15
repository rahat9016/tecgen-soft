import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const plans = [
  {
    name: "Business Website",
    price: "৳৮,০০০",
    note: "One-time",
    support: "২ মাস সাপোর্ট included",
    after: "৳৫০০/মাস (optional, চাইলে)",
    features: [
      "৫ পেজ পর্যন্ত ওয়েবসাইট",
      "Mobile Responsive Design",
      "Contact / Lead Form",
      "Basic SEO Setup",
      "Deployment",
      "Basic Training",
    ],
    highlight: false,
  },
  {
    name: "Starter E-commerce",
    price: "৳১৫,০০০",
    note: "One-time",
    support: "৩ মাস সাপোর্ট included",
    after: "৳৮০০/মাস (optional, চাইলে)",
    features: [
      "Admin Dashboard",
      "Product ও Category Management",
      "Order Management",
      "Shopping Cart ও Checkout",
      "Mobile Responsive Design",
      "Basic Training",
    ],
    highlight: true,
  },
  {
    name: "Hotel Booking",
    price: "৳২০,০০০",
    note: "One-time",
    support: "৩ মাস সাপোর্ট included",
    after: "৳৮০০/মাস (optional, চাইলে)",
    features: [
      "Room Management",
      "Booking ও Availability System",
      "Customer Management",
      "Admin Dashboard",
      "Mobile Responsive Design",
      "Basic Training",
    ],
    highlight: false,
  },
];

export default function PricingPreview() {
  return (
    <section id="pricing" className="bg-slate-50 py-14 md:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple & Transparent <span className="text-indigo-600">Pricing</span>
          </h2>
          <p className="mt-3 text-base text-slate-500">
            আপনি আগে থেকেই জানবেন — কত খরচ হবে এবং কী পাবেন। কোনো surprise bill নেই।
          </p>
        </Reveal>

        <StaggerGrid className="mt-10 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <StaggerItem
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border p-6 transition hover:-translate-y-1 ${
              plan.highlight
                ? "border-indigo-400 bg-indigo-600 text-white shadow-xl shadow-indigo-600/25 lg:scale-105"
                : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-900/10"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3.5 py-1 text-[10px] font-bold tracking-wide text-indigo-950 shadow-sm">
                MOST POPULAR
              </span>
            )}
            <h3 className={`text-sm font-semibold ${plan.highlight ? "text-indigo-100" : "text-slate-500"}`}>
              {plan.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className={`text-xs ${plan.highlight ? "text-indigo-100" : "text-slate-400"}`}>
                {plan.note}
              </span>
            </div>

            <div
              className={`mt-4 space-y-1 rounded-lg p-3 text-xs ${
                plan.highlight ? "bg-white/10" : "bg-slate-50"
              }`}
            >
              <p className={plan.highlight ? "text-white" : "text-slate-700"}>
                <strong>Support:</strong> {plan.support}
              </p>
              <p className={plan.highlight ? "text-indigo-100" : "text-slate-500"}>
                <strong>After support:</strong> {plan.after}
              </p>
            </div>

            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className={`mt-0.5 size-4 shrink-0 ${plan.highlight ? "text-white" : "text-indigo-600"}`} />
                  <span className={plan.highlight ? "text-indigo-50" : "text-slate-600"}>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="#contact"
              className={`mt-6 inline-flex h-11 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition ${
                plan.highlight
                  ? "bg-white text-indigo-700 hover:bg-indigo-50"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
            >
              বিস্তারিত জানুন
              <ArrowRight className="size-3.5" />
            </Link>
          </StaggerItem>
        ))}
      </StaggerGrid>

      <p className="mt-6 text-center text-xs text-slate-400">
        Domain, hosting ও অন্যান্য optional service আলাদা — অর্ডারের আগেই আপনাকে জানানো হবে।
      </p>
    </div>
    </section>
  );
}
