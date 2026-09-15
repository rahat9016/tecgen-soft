import { ClipboardList, LifeBuoy, MonitorPlay, Tags, Target, TrendingUp } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const reasons = [
  {
    icon: Tags,
    title: "Transparent Pricing",
    desc: "Know the cost before development starts.",
  },
  {
    icon: ClipboardList,
    title: "Clear Scope",
    desc: "Every package clearly explains what is included.",
  },
  {
    icon: MonitorPlay,
    title: "Real Demos",
    desc: "See the actual product before buying.",
  },
  {
    icon: Target,
    title: "Business Focused",
    desc: "We build around your business needs.",
  },
  {
    icon: LifeBuoy,
    title: "Support After Launch",
    desc: "We provide the agreed post-launch support.",
  },
  {
    icon: TrendingUp,
    title: "Future Upgrades",
    desc: "Your website can grow as your business grows.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="relative overflow-hidden bg-[#061531] py-16 md:py-24">
      {/* decorative glow */}
      <div className="pointer-events-none absolute top-0 right-0 size-96 rounded-full bg-[#3D2EF9]/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 size-72 rounded-full bg-indigo-400/10 blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur-sm">
            Why Tecgen Soft
          </span>
          <h2 className="mt-5 text-3xl leading-[1.15] font-bold tracking-tight text-white sm:text-4xl">
            আমরা শুধু website বানাই না —{" "}
            <span className="bg-linear-to-r from-indigo-400 via-[#6C63FF] to-indigo-300 bg-clip-text text-transparent">
              আপনার ব্যবসার partner
            </span>{" "}
            হয়ে কাজ করি।
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">
            Clear pricing, real demos এবং launch-এর পরও পাশে থাকা — এই তিনটি জিনিসের ওপর ভিত্তি
            করেই আমাদের প্রতিটি প্রজেক্ট চলে।
          </p>
        </Reveal>

        <StaggerGrid className="grid gap-4 sm:grid-cols-2">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <StaggerItem
              key={title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 transition group-hover:bg-indigo-500 group-hover:text-white">
                <Icon className="size-4.5" />
              </span>
              <h3 className="mt-3.5 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{desc}</p>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
