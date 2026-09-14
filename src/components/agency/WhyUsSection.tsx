import { Check, X } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const freelancer = [
  "Scope অস্পষ্ট থাকে",
  "Pricing পরিবর্তন হতে পারে",
  "Documentation সীমিত থাকতে পারে",
  "Support নিশ্চিত নাও থাকতে পারে",
  "একজন মানুষের উপর সম্পূর্ণ নির্ভরশীল",
];

const agency = [
  "Clear package ও scope",
  "Clear deliverables",
  "Transparent pricing",
  "Professional development process",
  "Admin panel training",
  "নির্দিষ্ট support period",
  "ভবিষ্যতে upgrade করার সুযোগ",
];

export default function WhyUsSection() {
  return (
    <section className="bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Why Us?
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            আমরা কোনো freelancer-কে আক্রমণ করছি না — শুধু আমাদের approach টা কেমন, সেটা দেখাচ্ছি।
          </p>
        </Reveal>

        <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2">
          <StaggerItem className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-500">Typical Freelance Developer</h3>
            <ul className="mt-4 space-y-3">
              {freelancer.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <X className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  {item}
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem className="rounded-2xl border-2 border-indigo-200 bg-white p-6 shadow-lg shadow-indigo-600/5">
            <h3 className="text-sm font-semibold text-indigo-600">Our Agency</h3>
            <ul className="mt-4 space-y-3">
              {agency.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="mt-0.5 size-4 shrink-0 text-indigo-600" />
                  {item}
                </li>
              ))}
            </ul>
          </StaggerItem>
        </StaggerGrid>
      </div>
    </section>
  );
}
