import { ArrowRight, CreditCard, Headset, LineChart, Package, Smartphone as PhoneIcon, Truck } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const addOns = [
  { icon: CreditCard, label: "Online Payment (bKash/Nagad/SSLCommerz)" },
  { icon: LineChart, label: "Advanced Reports" },
  { icon: Package, label: "Inventory / POS" },
  { icon: Truck, label: "Delivery Integration" },
  { icon: Headset, label: "Customer Loyalty" },
  { icon: PhoneIcon, label: "Mobile App" },
];

export default function GrowthSection() {
  return (
    <section className="bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Start Small. Grow Later.
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            আপনার ব্যবসা বড় হলে আপনার website-ও বড় হবে। প্রথম দিনই সবকিছু কিনতে হবে না।
          </p>
        </Reveal>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Reveal delay={0.1} className="rounded-2xl border border-indigo-200 bg-white px-6 py-4 shadow-sm">
            <p className="text-xs text-slate-400">শুরু</p>
            <p className="text-sm font-semibold text-slate-900">Basic E-commerce Website</p>
          </Reveal>
          <ArrowRight className="size-5 shrink-0 rotate-90 text-indigo-400 sm:rotate-0" />
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {addOns.map(({ icon: Icon, label }) => (
              <StaggerItem
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon className="size-4" />
                </span>
                <span className="text-[11px] leading-snug font-medium text-slate-600">{label}</span>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>
    </section>
  );
}
