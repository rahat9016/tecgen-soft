import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hotel, Shirt, Smartphone, Trophy, type LucideIcon } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const solutions = [
  {
    icon: Hotel,
    name: "Hotel Booking Management",
    bn: "হোটেল, রিসোর্ট, গেস্ট হাউস — online room booking ও management",
    price: "৳১,২৯৯",
    features: [
      "Room Management ও Availability",
      "Online Booking System",
      "Admin Dashboard",
      "Custom Logo, Color ও Design",
    ],
    href: "/solutions/hotel-booking",
    preview: "/solutions/hotel-booking",
    accent: "from-sky-400 to-blue-600",
    popular: true,
  },
  {
    icon: Smartphone,
    name: "Gadget E-commerce",
    bn: "মোবাইল ও গ্যাজেট shop — pre-order ও order tracking সহ",
    price: "৳১,০৯০",
    features: [
      "Pre-order ও Order Tracking",
      "Cash Memo ও Sales Report",
      "Admin Dashboard",
      "Custom Logo, Color ও Design",
    ],
    href: "/solutions/gadget-ecommerce",
    preview: "/solutions/gadget-ecommerce",
    accent: "from-indigo-400 to-[#3D2EF9]",
  },
  {
    icon: Shirt,
    name: "Fashion E-commerce",
    bn: "কাপড়, শাড়ি, থ্রি-পিস, কসমেটিকস — মেয়েদের fashion অনলাইন শপ",
    price: "৳৯৯৯",
    features: [
      "Product ও Category Management",
      "Shopping Cart ও Checkout",
      "Admin Dashboard",
      "Custom Logo, Color ও Design",
    ],
    href: "/solutions/ecommerce",
    preview: "/solutions/ecommerce",
    accent: "from-pink-400 to-rose-500",
  },
  {
    icon: Trophy,
    name: "Turf Booking",
    bn: "ফুটবল টার্ফ, ক্রিকেট নেট ও indoor court — live slot booking",
    price: "৳৮৯৯",
    features: ["Live Slot Schedule", "Advance Payment (bKash/Nagad)", "Admin Dashboard", "Custom Logo, Color ও Design"],
    href: "/solutions/turf-booking",
    preview: "/solutions/turf-booking",
    accent: "from-emerald-400 to-green-600",
  },
];

/** Real screenshots of the live demo, shown as a laptop browser with a phone in front. */
function DevicePreview({
  name,
  preview,
  accent,
  icon: Icon,
}: {
  name: string;
  preview: string;
  accent: string;
  icon: LucideIcon;
}) {
  return (
    <div className="relative -mx-6 -mt-6 mb-5 aspect-16/11 overflow-hidden rounded-t-2xl border-b border-white/10">
      <div className={`absolute inset-0 bg-linear-to-br ${accent} opacity-25`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_60%)]" />

      {/* desktop browser */}
      <div className="absolute top-5 left-4 w-[78%] overflow-hidden rounded-lg border border-white/15 bg-neutral-900 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]">
        <div className="flex h-3 items-center gap-1 bg-white/10 px-1.5">
          <span className="size-1 rounded-full bg-white/40" />
          <span className="size-1 rounded-full bg-white/40" />
          <span className="size-1 rounded-full bg-white/40" />
        </div>
        <div className="relative aspect-16/10">
          <Image
            src={`${preview}-desktop.webp`}
            alt={`${name} — desktop`}
            fill
            sizes="(min-width: 1280px) 230px, (min-width: 640px) 40vw, 80vw"
            className="object-cover object-top"
          />
        </div>
      </div>

      {/* phone */}
      <div className="absolute right-4 bottom-3 w-[26%] overflow-hidden rounded-[14px] border-[3px] border-neutral-950 bg-neutral-950 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.8)] ring-1 ring-white/20">
        <div className="relative aspect-9/19">
          <Image
            src={`${preview}-mobile.webp`}
            alt={`${name} — mobile`}
            fill
            sizes="(min-width: 1280px) 80px, (min-width: 640px) 12vw, 25vw"
            className="object-cover object-top"
          />
          <span className="absolute top-1 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-neutral-950" />
        </div>
      </div>

      <span
        className={`absolute bottom-3 left-4 flex size-9 items-center justify-center rounded-xl bg-linear-to-br ${accent} text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_10px_24px_-8px_rgba(0,0,0,0.8)] ring-1 ring-white/25`}
      >
        <Icon className="size-4.5" />
      </span>
    </div>
  );
}

export default function SolutionsSection() {
  return (
    <section id="solutions" className="relative py-10 sm:py-14 md:py-18">
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-80 w-[60%] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            আপনার ব্যবসার জন্য কোন{" "}
            <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
              Solution
            </span>{" "}
            দরকার?
          </h2>
          <p className="mt-3 text-base text-neutral-400">
            Monthly subscription — hosting, SSL, updates ও support সহ। কোনো upfront খরচ নেই।
          </p>
        </Reveal>

        <StaggerGrid className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {solutions.map(({ icon: Icon, name, bn, price, features, href, preview, accent, popular }) => (
            <StaggerItem
              key={name}
              className={`glass relative flex flex-col rounded-2xl p-6 transition hover:-translate-y-1 ${
                popular
                  ? "border-indigo-300/40 bg-white/[0.08] before:pointer-events-none before:absolute before:inset-x-8 before:-top-px before:h-px before:bg-linear-to-r before:from-transparent before:via-indigo-300 before:to-transparent hover:border-indigo-300/60"
                  : "hover:border-white/20 hover:bg-white/[0.07]"
              }`}
            >
              {popular && (
                <span className="absolute -top-3 left-6 z-10 rounded-full bg-[#3D2EF9] px-3 py-1 text-[10px] font-bold tracking-wide text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_6px_20px_-4px_rgba(61,46,249,0.9)]">
                  MOST POPULAR
                </span>
              )}
              <DevicePreview name={name} preview={preview} accent={accent} icon={Icon} />
              <h3 className="truncate text-base font-semibold text-white" title={name}>
                {name}
              </h3>
              <p className="mt-1.5 line-clamp-2 min-h-[2lh] text-sm leading-relaxed text-neutral-400">{bn}</p>

              <div className="mt-4 space-y-1 border-y border-dashed border-white/10 py-3">
                <p className="text-indigo-300">
                  <span className="text-2xl font-bold">{price}</span>
                  <span className="text-sm font-medium text-neutral-400">/মাস</span>
                </p>
                <p className="text-xs text-neutral-500">১–৩ দিনে live · যেকোনো মাসে cancel</p>
              </div>

              <ul className="mt-3 flex-1 space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-sm text-neutral-300">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                className={`mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  popular
                    ? "bg-[#3D2EF9] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_10px_24px_-8px_rgba(61,46,249,0.8)] hover:bg-[#4d3ffa]"
                    : "border border-white/15 bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/[0.12]"
                }`}
              >
                View Details
                <ArrowRight className="size-3.5" />
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
