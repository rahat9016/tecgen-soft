import {
  ArrowUpRight,
  Facebook,
  Hotel,
  Mail,
  MessageCircle,
  Phone,
  Rocket,
  Shirt,
  ShoppingBag,
  Smartphone,
  Trophy,
} from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { CONTACT } from "@/src/lib/contact";

const audiences = [
  { icon: Rocket, label: "নতুন উদ্যোক্তা" },
  { icon: ShoppingBag, label: "FB / Insta Seller" },
  { icon: Shirt, label: "Clothing ও Cosmetics" },
  { icon: Smartphone, label: "Gadget Shop" },
  { icon: Hotel, label: "Hotel / Resort" },
  { icon: Trophy, label: "Turf / খেলার মাঠ" },
];

const approach = [
  { title: "Clear pricing ও scope", desc: "কাজ শুরুর আগেই খরচ ও কী পাবেন — সব জানানো।" },
  { title: "Real demo দেখানো", desc: "কেনার আগে আসল product নিজে ব্যবহার করে দেখুন।" },
  { title: "Subscription-এ সবসময় support", desc: "যতদিন সাথে আছেন, ততদিন support, updates ও bug fix।" },
];

const contacts = [
  { icon: Phone, label: "Call", value: CONTACT.phoneDisplay, href: CONTACT.phoneHref },
  { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { icon: MessageCircle, label: "WhatsApp", value: "Message us", href: CONTACT.whatsappHref },
  { icon: Facebook, label: "Facebook", value: "Visit our Page", href: CONTACT.facebookHref },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-14 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* intro + contact — brand card */}
        <Reveal className="glass relative overflow-hidden rounded-3xl p-7 sm:p-10 lg:col-span-7 lg:row-span-2">
          <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-white/[0.08] blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-white/[0.04] blur-[90px]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 80% 70% at 80% 0%, #000 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 80% 0%, #000 20%, transparent 70%)",
            }}
          />

          <div className="relative flex h-full flex-col">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-indigo-200">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              About Us · Dhaka, Bangladesh
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Who is{" "}
              <span className="bg-linear-to-r from-indigo-300 via-[#7C74FF] to-indigo-400 bg-clip-text text-transparent">
                Tecgen Soft
              </span>
              ?
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg">
              <span className="font-semibold text-white">Tecgen Soft</span> is a technology agency dedicated to
              engineering <span className="font-semibold text-white">reliable, cost-effective digital solutions</span>{" "}
              for growing businesses. We design and build high-performance e-commerce platforms, booking systems, and
              custom web applications—eliminating technical complexity so you can focus entirely on scaling your core
              business.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-auto lg:pt-10">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 transition hover:border-white/25 hover:bg-white/[0.08]"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#3D2EF9] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_20px_-6px_rgba(61,46,249,0.8)]">
                    <Icon className="size-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] tracking-wide text-neutral-400 uppercase">{label}</span>
                    <span className="block truncate text-sm font-semibold text-white">{value}</span>
                  </span>
                  <ArrowUpRight className="size-4 text-neutral-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* who we work with */}
        <Reveal delay={0.1} className="glass rounded-3xl p-6 sm:p-7 lg:col-span-5">
          <p className="text-sm font-semibold text-white">আমরা যাদের সাথে কাজ করি</p>
          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {audiences.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-4 text-center transition hover:-translate-y-0.5 hover:border-indigo-300/40 hover:bg-white/[0.07]"
              >
                <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-indigo-200 transition group-hover:border-transparent group-hover:bg-[#3D2EF9] group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <span className="text-xs leading-snug font-medium text-neutral-300">{label}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* approach */}
        <Reveal
          delay={0.15}
          className="glass rounded-3xl border-white/15 bg-linear-to-br from-white/[0.09] via-white/[0.03] to-transparent p-6 sm:p-7 lg:col-span-5"
        >
          <p className="text-sm font-semibold text-white">
            আমাদের approach — <span className="text-indigo-300">সহজ</span>
          </p>
          <ol className="relative mt-5 space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-indigo-300/25">
            {approach.map((step, i) => (
              <li key={step.title} className="relative flex gap-4">
                <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#3D2EF9] text-xs font-bold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_0_0_4px_rgba(61,46,249,0.18)]">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-neutral-400">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
