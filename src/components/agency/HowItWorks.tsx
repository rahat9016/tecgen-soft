import {
  ClipboardCheck,
  CodeXml,
  GraduationCap,
  MessageSquareText,
  MonitorCheck,
  Palette,
} from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const steps = [
  {
    n: "01",
    icon: ClipboardCheck,
    title: "Requirement Confirmation",
    bn: "আপনার business বুঝে নিয়ে package চূড়ান্ত করি।",
  },
  {
    n: "02",
    icon: Palette,
    title: "Design",
    bn: "আপনার business অনুযায়ী website-এর design তৈরি করি।",
  },
  {
    n: "03",
    icon: CodeXml,
    title: "Development",
    bn: "Website ও admin system develop করা হয়।",
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
    bn: "Website প্রস্তুত করে launch করা হয়।",
  },
  {
    n: "06",
    icon: GraduationCap,
    title: "Training & Support",
    bn: "কীভাবে চালাবেন শিখিয়ে দিই ও agreed সময় পর্যন্ত support দিই।",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          আপনার টাকা দেওয়ার পর কী হবে?
        </h2>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          Technical কিছু বুঝতে হবে না — পুরো প্রক্রিয়া খুবই সহজ ও পরিষ্কার।
        </p>
      </Reveal>

      <StaggerGrid className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
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
