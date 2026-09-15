import {
  Headset,
  MonitorPlay,
  PackageCheck,
  Settings2,
  TrendingUp,
} from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

function TakaIcon({ className }: { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center text-lg leading-none font-bold ${className ?? ""}`}
      aria-hidden="true"
    >
      ৳
    </span>
  );
}

const cards = [
  {
    icon: TakaIcon,
    title: "Clear Pricing",
    bn: "কাজ শুরুর আগেই খরচ জানবেন।",
    desc: "Know the cost before development starts.",
  },
  {
    icon: MonitorPlay,
    title: "Real Demos",
    bn: "কেনার আগেই আসল product দেখবেন।",
    desc: "See the actual product before you buy.",
  },
  {
    icon: PackageCheck,
    title: "Clear Deliverables",
    bn: "কী পাচ্ছেন, তা আগেই নির্দিষ্ট।",
    desc: "Know exactly what you will receive.",
  },
  {
    icon: Headset,
    title: "Local Support",
    bn: "বাংলাদেশ থেকেই সরাসরি যোগাযোগ ও সাপোর্ট।",
    desc: "Bangladesh-based communication and support.",
  },
  {
    icon: Settings2,
    title: "Easy Management",
    bn: "টেকনিক্যাল জ্ঞান ছাড়াই নিজে চালাতে পারবেন।",
    desc: "Manage your website without technical knowledge.",
  },
  {
    icon: TrendingUp,
    title: "Future Upgrades",
    bn: "ছোট থেকে শুরু করুন, পরে বড় করুন।",
    desc: "Start small and expand later.",
  },
];

export default function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-18 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Built for entrepreneurs who want{" "}
          <span className="text-indigo-600">clarity</span>.
        </h2>
        <p className="mt-3 text-base text-slate-500">
          কী পাবেন, কত খরচ হবে এবং কী থাকছে না — সবকিছু আগে থেকেই পরিষ্কার।
        </p>
      </Reveal>

      <StaggerGrid className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ icon: Icon, title, bn, desc }) => (
          <StaggerItem
            key={title}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/5"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 transition group-hover:bg-indigo-600 group-hover:text-white group-hover:ring-indigo-600">
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
