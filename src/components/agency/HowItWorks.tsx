import { Clock3, GraduationCap, MousePointerClick, RefreshCcw, Rocket, ServerCog, Wallet } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const steps = [
  {
    n: "01",
    icon: MousePointerClick,
    when: "আজই",
    title: "Product বেছে নিন",
    bn: "Live demo দেখে আপনার ব্যবসার জন্য সঠিক product বেছে নিন — কোনটা লাগবে বুঝতে আমরা সাহায্য করি।",
  },
  {
    n: "02",
    icon: ServerCog,
    when: "Day 1",
    title: "Customization ও Setup",
    bn: "আপনার logo, color ও content বসাই, domain connect করে hosting ও SSL setup করি।",
  },
  {
    n: "03",
    icon: Rocket,
    when: "Day 1–3",
    title: "Review ও Launch",
    bn: "আপনি review করে feedback দেন — সব ঠিক থাকলে website live।",
    note: "এখান থেকে মাসিক payment শুরু",
  },
  {
    n: "04",
    icon: GraduationCap,
    when: "প্রতি মাসে",
    title: "Training ও Support",
    bn: "কীভাবে চালাবেন শিখিয়ে দিই; subscription চলাকালীন updates, bug fix ও support।",
  },
];

const facts = [
  { icon: Clock3, label: "মোট সময়", value: "১–৩ দিন" },
  { icon: Wallet, label: "Payment", value: "Live হওয়ার পর" },
  { icon: RefreshCcw, label: "Cancel", value: "যেকোনো মাসে" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-18 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-indigo-200">
          How It Works
        </span>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          অর্ডার করার পর{" "}
          <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
            কী হবে
          </span>
          ?
        </h2>
        <p className="mt-3 text-base text-neutral-400">
          No technical jargon — live in 1–3 days. Monthly payment starts only after your website goes live.
        </p>
      </Reveal>

      <StaggerGrid className="mt-12 grid gap-5 lg:mt-14 lg:grid-cols-4">
        {steps.map(({ n, icon: Icon, when, title, bn, note }, i) => (
          <StaggerItem key={n} className="relative flex gap-4 lg:flex-col lg:gap-0">
            {/* rail to the next step — vertical on small screens, horizontal from lg */}
            {i < steps.length - 1 && (
              <>
                <div className="absolute top-12 -bottom-5 left-6 w-px bg-linear-to-b from-indigo-300/60 to-indigo-300/10 lg:hidden" />
                <div className="absolute top-6 left-[calc(50%+1.5rem)] hidden h-px w-[calc(100%-1.75rem)] bg-linear-to-r from-indigo-300/70 via-indigo-300/30 to-indigo-300/70 lg:block" />
              </>
            )}

            <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-[#3D2EF9] text-sm font-bold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_0_0_6px_rgba(255,255,255,0.05),0_10px_24px_-8px_rgba(61,46,249,0.9)] lg:mx-auto">
              {n}
            </div>

            <div className="glass flex-1 rounded-2xl p-5 transition hover:border-white/20 hover:bg-white/[0.07] lg:mt-6 lg:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-indigo-300/20 bg-indigo-500/15 text-indigo-200">
                  <Icon className="size-5" />
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-neutral-300">
                  {when}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{bn}</p>
              {note && (
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  {note}
                </p>
              )}
            </div>
          </StaggerItem>
        ))}
      </StaggerGrid>

      <Reveal
        delay={0.1}
        className="glass mt-8 grid divide-y divide-white/10 rounded-2xl sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-center gap-3 px-5 py-4">
            <Icon className="size-5 shrink-0 text-indigo-300" />
            <span className="text-sm text-neutral-400">
              {label}: <span className="font-semibold text-white">{value}</span>
            </span>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
