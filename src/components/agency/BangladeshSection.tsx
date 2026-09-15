import { Facebook, HandCoins, Headset, Smartphone, Truck, Wallet } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const cards = [
  {
    icon: Smartphone,
    title: "Mobile First",
    desc: "Most customers visit from smartphones — every website is built mobile-first.",
  },
  {
    icon: Wallet,
    title: "Local Payment Options",
    desc: "bKash, Nagad ও SSLCommerz add-on হিসেবে যেকোনো package-এ যোগ করা যায়।",
  },
  {
    icon: Truck,
    title: "Cash on Delivery",
    desc: "E-commerce package-এ COD workflow সাপোর্ট করা হয়।",
  },
  {
    icon: Facebook,
    title: "Facebook & WhatsApp",
    desc: "আপনার existing Facebook Page ও WhatsApp-এর সাথে connect করে দেওয়া হয়।",
  },
  {
    icon: HandCoins,
    title: "Easy Admin",
    desc: "কোনো টেকনিক্যাল জ্ঞান ছাড়াই আপনার business নিজে manage করতে পারবেন।",
  },
  {
    icon: Headset,
    title: "Local Support",
    desc: "Bangladesh-based team-এর সাথে সরাসরি যোগাযোগ ও support।",
  },
];

export default function BangladeshSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-18 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700">
            🇧🇩 Made for Bangladesh
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            বাংলাদেশের ব্যবসার জন্য তৈরি
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Technology that fits the way local businesses actually operate — from the payment
            methods your customers already use to the way you&apos;ll manage orders day to day.
          </p>
        </Reveal>

        <StaggerGrid className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2">
          {cards.map(({ icon: Icon, title, desc }, i) => (
            <StaggerItem
              key={title}
              className={`flex items-start gap-3.5 border-slate-200 p-5 sm:p-6 ${
                i > 0 ? "border-t" : ""
              } ${i === 1 ? "sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""}`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon className="size-4.5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
