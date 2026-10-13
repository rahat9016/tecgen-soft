import { ClipboardList, LifeBuoy, MonitorPlay, Tags, Target, TrendingUp } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const reasons = [
  {
    icon: Tags,
    title: "Fixed Monthly Price",
    desc: "No upfront cost — pay monthly only after you go live.",
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
    title: "Always-on Support",
    desc: "Support, updates and fixes for as long as you subscribe.",
  },
  {
    icon: TrendingUp,
    title: "Future Upgrades",
    desc: "Your website can grow as your business grows.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="relative overflow-x-clip py-16 md:py-24">
      {/* decorative glow */}
      <div className="pointer-events-none absolute top-0 right-0 size-96 rounded-full bg-white/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 size-72 rounded-full bg-white/[0.04] blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <Reveal>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-indigo-200">
            Why Tecgen Soft
          </span>
          <h2 className="mt-5 text-3xl leading-[1.15] font-bold tracking-tight text-white sm:text-4xl">
            Website-এর সব technical ঝামেলা আমাদের —{" "}
            <span className="bg-linear-to-r from-indigo-400 via-[#6C63FF] to-indigo-300 bg-clip-text text-transparent">
              আপনি শুধু ব্যবসা
            </span>{" "}
            সামলান।
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-400">
            Hosting, SSL, updates, bug fix ও support — সবকিছু একটাই মাসিক fee-তে। কেনার আগে real
            demo দেখুন, live হওয়ার পর payment দিন, আর যেকোনো মাসে cancel করুন।
          </p>
        </Reveal>

        <StaggerGrid className="grid gap-4 sm:grid-cols-2">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <StaggerItem
              key={title}
              className="glass group rounded-2xl p-5 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <span className="flex size-10 items-center justify-center rounded-lg border border-indigo-300/20 bg-indigo-500/20 text-indigo-200 transition group-hover:border-transparent group-hover:bg-[#3D2EF9] group-hover:text-white">
                <Icon className="size-4.5" />
              </span>
              <h3 className="mt-3.5 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">{desc}</p>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
