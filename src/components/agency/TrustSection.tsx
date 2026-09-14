import {
  Eye,
  HandHeart,
  MapPin,
  Smartphone,
  Tags,
  Target,
} from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const cards = [
  {
    icon: Tags,
    title: "Transparent Pricing",
    bn: "যা দেখবেন, তাই দিতে হবে।",
    desc: "What you see is what you pay — কোনো লুকানো খরচ নেই।",
  },
  {
    icon: Eye,
    title: "Clear Deliverables",
    bn: "অর্ডার করার আগেই জানবেন কী পাচ্ছেন।",
    desc: "Before ordering, you can see exactly what is included.",
  },
  {
    icon: Target,
    title: "Business-Focused",
    bn: "শুধু সুন্দর ওয়েবসাইট না, কাজের ওয়েবসাইট।",
    desc: "We build websites that actually help your business operate.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    bn: "মোবাইল, ট্যাবলেট, ডেস্কটপ — সব জায়গায় perfect।",
    desc: "Your customers can use your website from any device.",
  },
  {
    icon: HandHeart,
    title: "Support After Delivery",
    bn: "ডেলিভারির পর আমরা হারিয়ে যাই না।",
    desc: "We stay with you after your website goes live.",
  },
  {
    icon: MapPin,
    title: "Bangladesh-Friendly",
    bn: "পেমেন্ট, যোগাযোগ, সাপোর্ট — সবই বাংলাদেশের জন্য।",
    desc: "Designed around local payment methods and communication.",
  },
];

export default function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Website কিনছেন না — আপনার ব্যবসার{" "}
          <span className="text-indigo-600">ভিত্তি</span> তৈরি করছেন।
        </h2>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          No Confusion. No Hidden Cost. Just a Clear Path to Launch Your Business.
        </p>
      </Reveal>

      <StaggerGrid className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ icon: Icon, title, bn, desc }) => (
          <StaggerItem
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm font-medium text-slate-700">{bn}</p>
            <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </section>
  );
}
