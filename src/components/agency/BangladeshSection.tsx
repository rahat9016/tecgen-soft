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
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          বাংলাদেশের ব্যবসার জন্য তৈরি
        </h2>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          Technology that fits the way local businesses actually operate.
        </p>
      </Reveal>

      <StaggerGrid className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ icon: Icon, title, desc }) => (
          <StaggerItem
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </section>
  );
}
