import Link from "next/link";
import { ArrowRight, Check, LayoutDashboard, MonitorPlay, Package, ShieldCheck, Zap } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

const included = ["Hosting", "SSL", "Updates", "Bug fix", "Support", "Domain setup"];

const iconTile =
  "flex size-11 items-center justify-center rounded-xl border border-indigo-300/20 bg-indigo-500/15 text-indigo-200";

export default function WhyUsSection() {
  return (
    <section className="relative overflow-x-clip py-10 sm:py-16 md:py-24">
      {/* decorative glow */}
      <div className="pointer-events-none absolute top-0 right-0 size-96 rounded-full bg-white/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 size-72 rounded-full bg-white/[0.04] blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-indigo-200">
            Why Tecgen Soft
          </span>
          <h2 className="mt-5 text-3xl leading-[1.15] font-semibold tracking-tight text-white sm:text-4xl">
            Technical ঝামেলা আমাদের,{" "}
            <span className="bg-linear-to-r from-indigo-400 via-[#6C63FF] to-indigo-300 bg-clip-text text-transparent">
              ব্যবসা আপনার।
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Ready software, একটাই মাসিক fee, আর সবসময় পাশে থাকা support — যাতে আপনি শুধু ব্যবসা বাড়ানোয় মন
            দিতে পারেন।
          </p>
        </Reveal>

        <StaggerGrid className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* all-in-one plan */}
          <StaggerItem className="glass relative overflow-hidden rounded-3xl p-5 sm:p-8 md:col-span-2">
            <div className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-[#3D2EF9]/25 blur-[90px]" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <span className={iconTile}>
                  <Package className="size-5" />
                </span>
                <span className="rounded-full border border-indigo-300/25 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                  ৳৮৯৯/মাস থেকে
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white sm:text-2xl">সবকিছু একটাই মাসিক fee-তে</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-400">
                আলাদা করে hosting কেনা, server চালানো বা developer খোঁজার দরকার নেই — website চালাতে যা লাগে সব
                subscription-এর মধ্যেই।
              </p>
              <ul className="mt-6 flex flex-wrap gap-2 md:mt-auto md:pt-6">
                {included.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-neutral-200"
                  >
                    <Check className="size-3.5 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* speed */}
          <StaggerItem className="glass flex flex-col rounded-3xl p-5 sm:p-8">
            <span className={iconTile}>
              <Zap className="size-5" />
            </span>
            <p className="mt-6 bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-6xl leading-none font-bold text-transparent">
              ১–৩
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">দিনে website live</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Product আগে থেকেই তৈরি — শুরু থেকে বানাতে হয় না, তাই অপেক্ষাও নেই।
            </p>
          </StaggerItem>

          {/* real demos */}
          <StaggerItem className="glass flex flex-col rounded-3xl p-5 sm:p-8">
            <span className={iconTile}>
              <MonitorPlay className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">কেনার আগে real demo</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Screenshot না — আসল website নিজে চালিয়ে দেখুন, তারপর সিদ্ধান্ত নিন।
            </p>
            <Link
              href="#work"
              className="group mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-indigo-300 transition hover:text-white md:mt-auto md:pt-5"
            >
              Live demos দেখুন
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </StaggerItem>

          {/* self-service */}
          <StaggerItem className="glass flex flex-col rounded-3xl p-5 sm:p-8">
            <span className={iconTile}>
              <LayoutDashboard className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">নিজেই সব manage করুন</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Product, order, booking — সহজ admin dashboard থেকে নিজেই update করুন, developer লাগবে না।
            </p>
          </StaggerItem>

          {/* no risk */}
          <StaggerItem className="glass flex flex-col rounded-3xl p-5 sm:p-8">
            <span className={iconTile}>
              <ShieldCheck className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">কোনো ঝুঁকি নেই</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Website live হওয়ার পর payment শুরু, আর যেকোনো মাসে cancel — কোনো চুক্তির বাঁধন নেই।
            </p>
          </StaggerItem>
        </StaggerGrid>
      </div>
    </section>
  );
}
