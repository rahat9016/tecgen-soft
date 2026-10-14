import { Info, ShieldCheck, Wallet } from "lucide-react";
import Image from "next/image";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const gateways = [
  { name: "bKash", type: "Mobile banking", logo: "/payments/bkash.webp", width: 208, height: 96 },
  { name: "Nagad", type: "Mobile banking", logo: "/payments/nagad.webp", width: 274, height: 96 },
  { name: "Visa", type: "Debit / credit card", logo: "/payments/visa.svg", width: 1000, height: 325 },
  { name: "Mastercard", type: "Debit / credit card", logo: "/payments/mastercard.svg", width: 1000, height: 618 },
];

/** Payment methods a client's site can take money through — shared by the home page and package pages. */
export default function PaymentGateways({ className = "py-10 sm:py-14 md:py-18" }: { className?: string }) {
  return (
    <section id="payments" className={className}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
            <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
              পেমেন্ট গেটওয়ে
            </span>{" "}
            যুক্ত করুন
          </h2>
          <p className="text-bn mx-auto mt-3 max-w-xl text-[15px] text-neutral-400 sm:text-base">
            নিরাপদ ও সহজ লেনদেনের জন্য দেশের জনপ্রিয় সব পেমেন্ট সিস্টেম যুক্ত করার সুযোগ।
          </p>
        </Reveal>

        <StaggerGrid className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4">
          {gateways.map((g) => (
            <StaggerItem key={g.name} className="glass flex flex-col items-center rounded-2xl p-4 text-center sm:p-5">
              <div className="flex h-20 w-full items-center justify-center rounded-xl bg-white/95 px-6">
                <Image
                  src={g.logo}
                  alt={g.name}
                  width={g.width}
                  height={g.height}
                  unoptimized={g.logo.endsWith(".svg")}
                  className="h-9 w-auto max-w-full object-contain"
                />
              </div>
              <p className="mt-4 text-base font-semibold text-white">{g.name}</p>
              <p className="text-sm text-neutral-500">{g.type}</p>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2.5 text-sm text-neutral-400">
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-300/80" />
            নিরাপদ লেনদেন
          </li>
          <li className="flex items-center gap-1.5">
            <Wallet className="size-4 text-emerald-300/80" />
            টাকা সরাসরি আপনার merchant account-এ
          </li>
          <li className="flex items-center gap-1.5">
            <Info className="size-4 text-neutral-500" />
            Gateway-র নিজস্ব transaction charge আলাদা
          </li>
        </ul>
      </div>
    </section>
  );
}
