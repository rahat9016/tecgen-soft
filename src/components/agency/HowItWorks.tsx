import {
  ClipboardCheck,
  GraduationCap,
  MessageSquareText,
  MonitorCheck,
  Palette,
  ServerCog,
} from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const steps = [
  {
    n: "01",
    icon: ClipboardCheck,
    title: "Requirement Confirmation",
    bn: "আপনার business বুঝে নিয়ে সঠিক product বেছে নিই।",
  },
  {
    n: "02",
    icon: Palette,
    title: "Customization",
    bn: "আপনার logo, color ও content দিয়ে website সাজাই।",
  },
  {
    n: "03",
    icon: ServerCog,
    title: "Setup",
    bn: "আপনার domain connect করে hosting ও SSL setup করি।",
  },
  {
    n: "04",
    icon: MessageSquareText,
    title: "Review",
    bn: "আপনি website review করে feedback দেন।",
  },
  {
    n: "05",
    icon: MonitorCheck,
    title: "Launch",
    bn: "Website live হয় — এরপর থেকে মাসিক payment শুরু।",
  },
  {
    n: "06",
    icon: GraduationCap,
    title: "Training & Support",
    bn: "কীভাবে চালাবেন শিখিয়ে দিই ও subscription চলাকালীন support দিই।",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-18 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          অর্ডার করার পর{" "}
          <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
            কী হবে
          </span>
          ?
        </h2>
        <p className="mt-3 text-base text-neutral-400">
          No technical jargon — six clear steps, live in ১–৩ দিন. Monthly payment starts only after your website goes live.
        </p>
      </Reveal>

      <div className="glass mt-12 rounded-3xl px-6 py-10 sm:px-10">
        <StaggerGrid className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          {steps.map(({ n, icon: Icon, title, bn }, i) => (
            <StaggerItem key={n} className="relative text-center">
              {/* dashed rail from this step's node to the next one */}
              {i < steps.length - 1 && (
                <div className="absolute top-6 left-1/2 hidden h-px w-[calc(100%+2rem)] border-t border-dashed border-white/20 lg:block" />
              )}
              <div className="relative z-10 mx-auto flex size-12 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-[#3D2EF9] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_0_0_6px_rgba(255,255,255,0.05),0_10px_24px_-8px_rgba(61,46,249,0.9)]">
                <Icon className="size-5" />
              </div>
              <p className="mt-4 text-xs font-semibold tracking-wide text-indigo-300">STEP {n}</p>
              <h3 className="mt-1 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">{bn}</p>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
