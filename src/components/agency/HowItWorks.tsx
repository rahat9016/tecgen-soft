import { ClipboardCheck, GraduationCap, MessageSquareText, MonitorCheck, Palette } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const steps = [
  {
    n: "01",
    icon: ClipboardCheck,
    title: "Choose Your Solution",
    bn: "আপনার ব্যবসার জন্য উপযুক্ত website বেছে নিন।",
  },
  {
    n: "02",
    icon: MessageSquareText,
    title: "Discuss Your Business",
    bn: "আমাদের সাথে আপনার business requirement শেয়ার করুন।",
  },
  {
    n: "03",
    icon: Palette,
    title: "Design & Development",
    bn: "আমাদের টিম আপনার website তৈরি করে।",
  },
  {
    n: "04",
    icon: MonitorCheck,
    title: "Review & Launch",
    bn: "আপনি website review করবেন, আমরা launch-এর জন্য প্রস্তুত করব।",
  },
  {
    n: "05",
    icon: GraduationCap,
    title: "Training & Support",
    bn: "কীভাবে চালাবেন শিখিয়ে দেব ও agreed সময় পর্যন্ত support দেব।",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          How It Works
        </h2>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          Technical কিছু বুঝতে হবে না — পুরো প্রক্রিয়া খুবই সহজ ও পরিষ্কার।
        </p>
      </Reveal>

      <StaggerGrid className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map(({ n, icon: Icon, title, bn }, i) => (
          <StaggerItem key={n} className="relative">
            {i < steps.length - 1 && (
              <div className="absolute top-6 left-[60%] hidden h-px w-full border-t border-dashed border-slate-300 lg:block" />
            )}
            <div className="relative flex size-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-600/20">
              <Icon className="size-5" />
            </div>
            <p className="mt-4 text-xs font-semibold tracking-wide text-indigo-500">STEP {n}</p>
            <h3 className="mt-1 text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{bn}</p>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </section>
  );
}
