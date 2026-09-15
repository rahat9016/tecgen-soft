import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Hotel,
  MessagesSquare,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const solutions = [
  {
    icon: ShoppingBag,
    name: "E-commerce Website",
    bn: "কাপড়, শাড়ি, থ্রি-পিস, কসমেটিকস, ইলেকট্রনিক্স, গ্রোসারি — যেকোনো অনলাইন শপ",
    price: "৳১৫,০০০ থেকে শুরু",
    delivery: "৭–১০ দিন ডেলিভারি",
    features: ["Product ও Category Management", "Shopping Cart ও Checkout", "Admin Dashboard"],
    href: "/solutions/ecommerce",
    accent: "bg-indigo-600",
    popular: true,
  },
  {
    icon: Hotel,
    name: "Hotel Booking Website",
    bn: "হোটেল, রিসোর্ট, গেস্ট হাউস, অ্যাপার্টমেন্ট বুকিং সিস্টেম",
    price: "৳২০,০০০ থেকে শুরু",
    delivery: "১০–১৪ দিন ডেলিভারি",
    features: ["Room Management ও Availability", "Online Booking System", "Admin Dashboard"],
    href: "/solutions/hotel-booking",
    accent: "bg-blue-600",
  },
  {
    icon: Building2,
    name: "Business Website",
    bn: "কোম্পানি, এজেন্সি, কনসালট্যান্ট, সার্ভিস প্রোভাইডার",
    price: "৳৮,০০০ থেকে শুরু",
    delivery: "৫–৭ দিন ডেলিভারি",
    features: ["Home, About, Services, Contact", "Lead / Contact Form", "Mobile Responsive Design"],
    href: "/solutions/business-website",
    accent: "bg-slate-700",
  },
  {
    icon: UtensilsCrossed,
    name: "Restaurant Website",
    bn: "রেস্টুরেন্ট, ক্যাফে, ফুড বিজনেসের জন্য মেনু ও অর্ডার তথ্য",
    price: "৳১০,০০০ থেকে শুরু",
    delivery: "৭ দিন ডেলিভারি",
    features: ["Menu ও Food Categories", "Location ও Contact", "Reservation (package অনুযায়ী)"],
    href: "/solutions/restaurant",
    accent: "bg-amber-500",
  },
];

export default function SolutionsSection() {
  return (
    <section id="solutions" className="py-14 md:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            আপনার ব্যবসার জন্য কোন <span className="text-indigo-600">Solution</span> দরকার?
          </h2>
          <p className="mt-3 text-base text-slate-500">
            Pick the package built for your business type.
          </p>
        </Reveal>

        <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map(({ icon: Icon, name, bn, price, delivery, features, href, accent, popular }) => (
            <StaggerItem
              key={name}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10 ${
                popular ? "border-indigo-300 ring-1 ring-indigo-100" : "border-slate-200"
              }`}
            >
              {popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold tracking-wide text-white shadow-sm">
                  MOST POPULAR
                </span>
              )}
              <span
                className={`flex size-12 items-center justify-center rounded-xl ${accent} text-white shadow-sm transition group-hover:scale-105`}
              >
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{bn}</p>

              <div className="mt-4 space-y-1 border-y border-dashed border-slate-200 py-3">
                <p className="text-base font-bold text-indigo-600">{price}</p>
                <p className="text-xs text-slate-400">{delivery}</p>
              </div>

              <ul className="mt-3 flex-1 space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-sm text-slate-600">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                View Details
                <ArrowRight className="size-3.5" />
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <Reveal
          delay={0.15}
          className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/60 p-6 sm:flex-row"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <MessagesSquare className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Custom Business Solution</p>
              <p className="text-xs text-slate-500">তালিকায় আপনার ব্যবসা না থাকলেও সমস্যা নেই — আমাদের বলুন।</p>
            </div>
          </div>
          <Link
            href="#contact"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Tell Us What You Need
            <ArrowRight className="size-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
