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
    <section className="bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Why Tecgen Soft?
          </h2>
        </Reveal>

        <StaggerGrid className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, desc }) => (
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
      </div>
    </section>
  );
}
