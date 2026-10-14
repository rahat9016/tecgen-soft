import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarX,
  Check,
  Globe,
  Minus,
  PackagePlus,
  RefreshCw,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  UserRound,
  Wallet,
  Wrench,
} from "lucide-react";

import AgencyFooter from "@/src/components/agency/AgencyFooter";
import AgencyHeader from "@/src/components/agency/AgencyHeader";
import AuroraBackground from "@/src/components/agency/AuroraBackground";
import FeatureShowcase from "@/src/components/agency/FeatureShowcase";
import PaymentGateways from "@/src/components/agency/PaymentGateways";
import Reveal from "@/src/components/agency/Reveal";
import ScreenGallery from "@/src/components/agency/ScreenGallery";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";
import { CONTACT } from "@/src/lib/contact";
import { describeScopeItem } from "@/src/lib/packageScope";
import { SOLUTIONS, getSolution } from "@/src/lib/solutions";

/** per-product glow behind the hero — kept soft so the page reads calm on a dark background */
const productGlow: Record<string, string> = {
  "hotel-booking": "rgba(56,189,248,0.14)",
  "gadget-ecommerce": "rgba(99,102,241,0.16)",
  ecommerce: "rgba(244,114,182,0.12)",
  "turf-booking": "rgba(52,211,153,0.12)",
};

const toBnDigits = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

/** status colours for the tracking flow — the last step is always the green "done" one */
const statusTones = [
  { dot: "border-amber-300/40 text-amber-200", pill: "bg-amber-400/10 text-amber-200" },
  { dot: "border-sky-300/40 text-sky-200", pill: "bg-sky-400/10 text-sky-200" },
  { dot: "border-indigo-300/40 text-indigo-200", pill: "bg-indigo-400/10 text-indigo-200" },
  { dot: "border-violet-300/40 text-violet-200", pill: "bg-violet-400/10 text-violet-200" },
];
const doneTone = { dot: "border-emerald-300/40 text-emerald-200", pill: "bg-emerald-400/10 text-emerald-200" };

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return {};
  return {
    title: `${solution.name} — Tecgen Soft`,
    description: solution.outcome,
  };
}

function SectionHeading({ title, desc }: { title: ReactNode; desc?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <h2 className="text-2xl font-semibold tracking-tight text-balance text-white sm:text-3xl lg:text-4xl">{title}</h2>
      {desc && <p className="text-bn mx-auto mt-3 max-w-xl text-[15px] text-neutral-400 sm:text-base">{desc}</p>}
    </Reveal>
  );
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  const glow = productGlow[solution.slug] ?? productGlow["gadget-ecommerce"];
  const preview = `/solutions/${solution.slug}`;
  const others = SOLUTIONS.filter((s) => s.slug !== solution.slug);

  // last word of the name gets the brand gradient, like the home hero
  const nameWords = solution.name.split(" ");
  const nameLead = nameWords.slice(0, -1).join(" ");
  const nameTail = nameWords[nameWords.length - 1];
  const [, ...priceNoteRest] = solution.priceNote.split(" · ");

  // dashboard slot in the hero — the admin panel when the demo has one, else another storefront page
  const dashScreen =
    solution.screens.find((s) => s.group === "admin") ?? solution.screens.find((s) => !s.src.endsWith("/home.webp"));

  const benefits = [
    { icon: Wallet, title: "শুরুতে কোনো টাকা লাগবে না", desc: "মাসে মাসে অল্প টাকা দিন — একসাথে বড় টাকা লাগবে না।" },
    { icon: Rocket, title: `${solution.setup}ের মধ্যে চালু`, desc: "Developer খোঁজা বা মাসের পর মাস অপেক্ষা করতে হবে না।" },
    { icon: SlidersHorizontal, title: "পুরো control আপনার হাতে", desc: "দাম, ছবি, অর্ডার বা বুকিং — নিজেই বদলান, developer লাগবে না।" },
    { icon: Smartphone, title: "Mobile-এ perfect", desc: "বেশিরভাগ কাস্টমার phone থেকে আসে — তাদের জন্য সহজ ও দ্রুত।" },
    { icon: ShieldCheck, title: "Technical ঝামেলা নেই", desc: "Hosting, security ও update — সব আমরা দেখি।" },
    { icon: CalendarX, title: "যেকোনো মাসে cancel", desc: "লম্বা চুক্তির বাধ্যবাধকতা নেই — domain ও data আপনার কাছেই থাকবে।" },
  ];

  const terms = [
    { icon: Globe, title: "Domain", desc: "আপনার নামে registered থাকবে — কেনা ও setup-এ আমরা সাহায্য করি।" },
    { icon: ShieldCheck, title: "Hosting ও SSL", desc: "Monthly subscription-এর মধ্যেই included।" },
    { icon: RefreshCw, title: "Updates, bug fix ও support", desc: `${solution.support} included।` },
    {
      icon: CalendarX,
      title: "যেকোনো মাসে cancel",
      desc: "Website offline হবে, কিন্তু domain ও আপনার content/data আপনার কাছেই থাকবে।",
    },
    { icon: PackagePlus, title: "Additional features", desc: "প্রতিটির খরচ কাজ শুরুর আগেই জানিয়ে দেওয়া হয়।" },
  ];

  const steps = [
    { label: "Order ও Setup", value: "৳০", note: "কোনো payment লাগবে না" },
    { label: "Website Live", value: solution.setup, note: "Setup শেষে আপনার site চালু" },
    { label: "প্রতি মাসে", value: solution.price, note: "Live হওয়ার পর থেকে billing" },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#0a0a0a]">
      <AuroraBackground />
      <AgencyHeader overlay />

      {/* hero — copy on the left (~35%), landing page + dashboard + mobile on the right (~65%) */}
      <section className="relative pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 50% 55% at 68% 35%, ${glow}, transparent 70%)` }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[35fr_65fr] lg:gap-10 lg:px-8">
          <Reveal className="text-center lg:text-left">
            <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-white sm:text-5xl">
              {nameLead}{" "}
              <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text whitespace-nowrap text-transparent">
                {nameTail}
              </span>
            </h1>
            <p className="text-bn mx-auto mt-5 max-w-md text-base text-neutral-400 sm:text-lg lg:mx-0">
              {solution.tagline}
            </p>

            <p className="mt-6 text-[15px] text-neutral-400">
              মাসে মাত্র <span className="text-2xl font-semibold text-white">{solution.price}</span>
              {priceNoteRest.length > 0 && (
                <span className="mt-1 block text-sm text-neutral-500">{priceNoteRest.join(" · ")}</span>
              )}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-medium text-[#0a0a0a] shadow-[0_10px_30px_-12px_rgba(255,255,255,0.4)] transition hover:-translate-y-0.5 hover:bg-neutral-200"
              >
                Get Started
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </Link>
              {solution.demoHref && (
                <Link
                  href={solution.demoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/6 px-6 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
                >
                  Live Demo
                  <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}
            </div>
          </Reveal>

          {/* product composition — landing page behind, dashboard in front-left, phone in front-right */}
          <Reveal delay={0.12} className="relative aspect-16/11 w-full">
            <div className="pointer-events-none absolute inset-x-[10%] top-1/4 h-1/2 rounded-full bg-white/7 blur-[100px]" />

            {/* landing page */}
            <div className="absolute top-0 right-0 w-[80%]">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/6 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)] backdrop-blur-xl">
                <div className="flex items-center gap-3 border-b border-white/10 bg-white/6 px-3 py-2 sm:px-4 sm:py-2.5">
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="size-2 rounded-full bg-white/30 sm:size-2.5" />
                    <span className="size-2 rounded-full bg-white/30 sm:size-2.5" />
                    <span className="size-2 rounded-full bg-white/30 sm:size-2.5" />
                  </div>
                  <div className="min-w-0 flex-1 truncate rounded-full border border-white/10 bg-white/6 px-3 py-0.5 text-center text-[10px] text-white/60 sm:text-[11px]">
                    {solution.name}
                  </div>
                </div>
                <div className="relative aspect-16/10">
                  <Image
                    src={`${preview}-desktop.webp`}
                    alt={`${solution.name} — landing page`}
                    fill
                    priority
                    sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 80vw"
                    className="object-cover object-top brightness-95"
                  />
                </div>
              </div>
            </div>

            {/* dashboard */}
            {dashScreen && (
              <div className="absolute bottom-[4%] left-0 z-10 w-[60%]">
                <div className="overflow-hidden rounded-xl border border-white/15 bg-neutral-900 shadow-[0_30px_60px_-16px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
                  <div className="flex h-5 items-center gap-1 border-b border-white/10 bg-white/8 px-2 sm:h-6">
                    <span className="size-1.5 rounded-full bg-white/30" />
                    <span className="size-1.5 rounded-full bg-white/30" />
                    <span className="size-1.5 rounded-full bg-white/30" />
                  </div>
                  <div className="relative aspect-16/10">
                    <Image
                      src={dashScreen.src}
                      alt={`${solution.name} — ${dashScreen.title}`}
                      fill
                      sizes="(min-width: 1280px) 460px, (min-width: 1024px) 38vw, 60vw"
                      className="object-cover object-top brightness-95"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* mobile */}
            <div className="absolute right-[3%] bottom-0 z-20 w-[19%]">
              <span className="glass-strong absolute -top-3.5 left-1/2 z-10 hidden -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white sm:inline-flex">
                Mobile
              </span>
              <div className="overflow-hidden rounded-[20px] border-4 border-neutral-950 bg-neutral-950 shadow-[0_30px_60px_-16px_rgba(0,0,0,0.85)] ring-1 ring-white/20">
                <div className="relative aspect-9/19">
                  <Image
                    src={`${preview}-mobile.webp`}
                    alt={`${solution.name} — mobile`}
                    fill
                    sizes="(min-width: 1280px) 150px, (min-width: 1024px) 12vw, 19vw"
                    className="object-cover object-top brightness-95"
                  />
                  <span className="absolute top-1.5 left-1/2 h-1.5 w-1/3 -translate-x-1/2 rounded-full bg-neutral-950" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* every page of the product — customer side and admin side */}
      {solution.screens.length > 0 && (
        <section id="screens" className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title={
                <>
                  প্রোডাক্টের{" "}
                  <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
                    প্রতিটি পেইজ
                  </span>{" "}
                  দেখুন
                </>
              }
              desc="আপনার ব্যবসার সবকিছু এক নজরে দেখে নিন, যেন পুরো কন্ট্রোল থাকে আপনার হাতেই।"
            />
            <Reveal className="mt-10 sm:mt-12">
              <ScreenGallery screens={solution.screens} name={solution.name} />
            </Reveal>
          </div>
        </section>
      )}

      {/* features — list beside a live-scrolling screenshot of the demo */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={
              <>
                আপনি{" "}
                <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
                  যা যা পাচ্ছেন
                </span>
              </>
            }
            desc="আপনার বিজনেস সহজ ও সুন্দরভাবে চালানোর জন্য দরকারি সব ফিচার একসাথে সাজানো রয়েছে।"
          />
          <div className="mt-10 sm:mt-14">
            <FeatureShowcase features={solution.features} pageSrc={`${preview}-page.webp`} title={solution.name} />
          </div>
        </div>
      </section>

      {/* order / booking tracking — the status flow the admin panel moves through */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title={solution.tracking.title} desc={solution.tracking.desc} />

          <div
            className={`mt-10 grid items-center gap-6 sm:mt-12 lg:gap-10 ${
              solution.tracking.screen ? "lg:grid-cols-[0.85fr_1.15fr]" : "mx-auto max-w-2xl"
            }`}
          >
            <Reveal className="glass rounded-3xl p-6 sm:p-8">
              <ol className="relative space-y-6 before:absolute before:top-4 before:bottom-4 before:left-4.5 before:w-px before:bg-white/10">
                {solution.tracking.steps.map((step, i) => {
                  const last = i === solution.tracking.steps.length - 1;
                  const tone = last ? doneTone : statusTones[i % statusTones.length];
                  return (
                    <li key={step.label} className="relative flex gap-4">
                      <span
                        className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border bg-neutral-900 text-xs font-semibold ${tone.dot}`}
                      >
                        {last ? <Check className="size-4" /> : toBnDigits(i + 1)}
                      </span>
                      <div className="min-w-0 pt-1">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tone.pill}`}>
                          {step.label}
                        </span>
                        <p className="text-bn mt-1 text-[15px] text-neutral-300">{step.desc}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Reveal>

            {solution.tracking.screen && (
              <Reveal delay={0.08}>
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/6 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)] backdrop-blur-xl">
                  <div className="flex items-center gap-3 border-b border-white/10 bg-white/6 px-4 py-3">
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-white/30" />
                      <span className="size-2.5 rounded-full bg-white/30" />
                      <span className="size-2.5 rounded-full bg-white/30" />
                    </div>
                    <div className="min-w-0 flex-1 truncate rounded-full border border-white/10 bg-white/6 px-3 py-1 text-center text-[11px] text-white/60">
                      {solution.name} · Admin panel
                    </div>
                  </div>
                  <div className="relative aspect-16/10">
                    <Image
                      src={solution.tracking.screen}
                      alt={`${solution.name} — ${solution.tracking.title}`}
                      fill
                      sizes="(min-width: 1024px) 680px, 100vw"
                      className="object-cover object-top brightness-95"
                    />
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* benefits — why an owner picks this over building their own site */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="আমাদের সফটওয়্যার থেকে আপনি কী কী সুবিধা পাবেন"
            desc="আপনার ব্যবসাকে দ্রুত বড় করতে ও সামনের দিকে এগিয়ে নিতে আমাদের কাছে রয়েছে সেরা সব সুবিধা।"
          />

          <StaggerGrid className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <StaggerItem key={title} className="glass flex gap-4 rounded-2xl p-5 sm:p-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#3D2EF9]/30 bg-[#3D2EF9]/15 text-indigo-200">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                  <p className="text-bn mt-1 text-[15px] text-neutral-400">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* included vs not included */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Order-এর আগেই সব পরিষ্কার"
            desc="কী পাচ্ছেন আর কী package-এর বাইরে — কোনো hidden খরচ নেই।"
          />

          <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-[1.55fr_1fr]">
            <Reveal className="glass relative overflow-hidden rounded-3xl border-emerald-300/15 bg-linear-to-br from-emerald-400/6 via-white/3 to-transparent p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-emerald-300/50 to-transparent" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
                    <Check className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Included</h3>
                    <p className="text-sm text-neutral-400">মাসিক subscription-এর মধ্যেই</p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  {toBnDigits(solution.included.length)}টি জিনিস
                </span>
              </div>

              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {solution.included.map((line) => {
                  const { icon: Icon, title, desc } = describeScopeItem(line);
                  return (
                    <li
                      key={line}
                      className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 p-3.5 sm:last:odd:col-span-2"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-300/15 bg-emerald-400/10 text-emerald-300">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-medium text-white">{title}</span>
                        {desc && <span className="text-bn mt-0.5 block text-sm text-neutral-400">{desc}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            <Reveal delay={0.08} className="glass rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-rose-300/15 bg-rose-400/8 text-rose-300/90">
                  <Minus className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Not included</h3>
                  <p className="text-sm text-neutral-400">এগুলোর খরচ আলাদা</p>
                </div>
              </div>

              <ul className="mt-6 divide-y divide-white/6">
                {solution.notIncluded.map((line) => {
                  const { icon: Icon, title, desc } = describeScopeItem(line);
                  return (
                    <li key={line} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-rose-300/15 bg-rose-400/8 text-rose-300/90">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-medium text-neutral-200">{title}</span>
                        {desc && <span className="text-bn mt-0.5 block text-sm text-neutral-500">{desc}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* responsibilities — step 1 you send, step 2 we build, then it's live */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="আপনার কাছ থেকে কী লাগবে?"
            desc="আপনি শুধু তথ্যগুলো দিন — technical সব কাজ আমাদের।"
          />

          <div className="mt-10 grid gap-4 sm:mt-12 lg:grid-cols-[1fr_auto_1fr] lg:gap-5">
            <Reveal className="glass rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-indigo-200">
                  <UserRound className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium text-neutral-500">ধাপ ১</p>
                  <h3 className="text-lg font-semibold text-white">আপনি দেবেন</h3>
                </div>
              </div>
              <p className="text-bn mt-3 text-sm text-neutral-400">Order করার পর WhatsApp-এ এগুলো পাঠিয়ে দিন।</p>

              <ul className="mt-5 divide-y divide-white/6">
                {solution.customerProvides.map((line) => {
                  const { icon: Icon, title, desc } = describeScopeItem(line);
                  return (
                    <li key={line} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-indigo-200">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-medium text-white">{title}</span>
                        {desc && <span className="text-bn mt-0.5 block text-sm text-neutral-400">{desc}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            <div aria-hidden="true" className="flex items-center justify-center">
              <span className="glass-strong flex size-11 items-center justify-center rounded-full bg-black/40 text-indigo-200">
                <ArrowRight className="size-5 rotate-90 lg:rotate-0" />
              </span>
            </div>

            <Reveal
              delay={0.08}
              className="glass relative overflow-hidden rounded-3xl border-indigo-300/20 bg-linear-to-br from-[#3D2EF9]/10 via-white/3 to-transparent p-6 sm:p-8"
            >
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-indigo-300/50 to-transparent" />
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-[#3D2EF9]/30 bg-[#3D2EF9]/20 text-indigo-200">
                  <Wrench className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium text-neutral-500">ধাপ ২</p>
                  <h3 className="text-lg font-semibold text-white">আমরা করব</h3>
                </div>
              </div>
              <p className="text-bn mt-3 text-sm text-neutral-400">সব subscription-এর মধ্যেই — আলাদা কোনো খরচ নেই।</p>

              <ul className="mt-5 divide-y divide-white/6">
                {solution.weHandle.map((line) => {
                  const { icon: Icon, title, desc } = describeScopeItem(line);
                  return (
                    <li key={line} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3D2EF9]/30 bg-[#3D2EF9]/15 text-indigo-200">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-medium text-white">{title}</span>
                        {desc && <span className="text-bn mt-0.5 block text-sm text-neutral-400">{desc}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>

          <Reveal className="glass mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-5 text-center sm:mt-5 sm:flex-row sm:text-left">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
              <Rocket className="size-5" />
            </span>
            <p className="text-bn text-[15px] text-neutral-300">
              <span className="font-semibold text-white">তারপর {solution.setup}ের মধ্যে আপনার website live</span> — আপনি
              শুধু ব্যবসা চালান।
            </p>
          </Reveal>
        </div>
      </section>

      {/* how billing works */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Payment কীভাবে কাজ করে"
            desc="শুরুতে বা setup-এর জন্য কোনো টাকা লাগবে না — website চালু হওয়ার পর থেকে মাসিক payment শুরু।"
          />

          <StaggerGrid className="relative mt-10 grid gap-3 sm:mt-12 sm:gap-4 md:grid-cols-3">
            {steps.map((step, i) => {
              const last = i === steps.length - 1;
              return (
                <StaggerItem
                  key={step.label}
                  className={`glass relative rounded-2xl p-5 sm:p-6 ${
                    last ? "border-indigo-300/30 bg-linear-to-br from-[#3D2EF9]/10 to-transparent" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
                      Step {i + 1}
                    </span>
                    {!last && <ArrowRight className="hidden size-4 text-neutral-600 md:block" />}
                  </div>
                  <p className="mt-3 text-sm text-neutral-400">{step.label}</p>
                  <p className={`mt-1 text-2xl font-semibold tracking-tight ${last ? "text-indigo-200" : "text-white"}`}>
                    {step.value}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">{step.note}</p>
                </StaggerItem>
              );
            })}
          </StaggerGrid>

          <StaggerGrid className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {terms.map(({ icon: Icon, title, desc }, i) => (
              <StaggerItem
                key={title}
                className={`glass flex gap-4 rounded-2xl p-5 ${i === terms.length - 1 ? "sm:col-span-2" : ""}`}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-indigo-200">
                  <Icon className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="text-bn mt-0.5 text-sm text-neutral-400">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <PaymentGateways className="py-12 sm:py-16" />

      {/* other packages */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="অন্যান্য প্যাকেজগুলোও দেখুন" desc="আপনার দরকার ও বাজেট অনুযায়ী পছন্দের প্যাকেজটি বেছে নিন।" />

          <StaggerGrid className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {others.map((s) => (
              <StaggerItem key={s.slug}>
                <Link
                  href={`/solutions/${s.slug}`}
                  className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/7"
                >
                  <div className="relative aspect-16/10 overflow-hidden border-b border-white/10">
                    <Image
                      src={`/solutions/${s.slug}-desktop.webp`}
                      alt={s.name}
                      fill
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top brightness-90 transition duration-500 group-hover:scale-[1.03] group-hover:brightness-100"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-semibold text-white">{s.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-400">{s.outcome}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-white/10 pt-4">
                      <p className="text-indigo-200">
                        <span className="text-lg font-semibold">{s.price}</span>
                        <span className="text-sm text-neutral-500">/মাস</span>
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-neutral-300 transition group-hover:text-white">
                        বিস্তারিত
                        <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <AgencyFooter />
    </div>
  );
}
