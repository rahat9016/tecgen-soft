import Link from "next/link";
import { MessageCircle, Phone, Send } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";

export default function FinalCta() {
  return (
    <section id="contact" className="relative overflow-hidden bg-indigo-700 py-16 md:py-20">
      <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-blue-500/20 blur-3xl" />

      <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          আপনার ব্যবসার জন্য কোন website দরকার বুঝতে পারছেন না?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
          আমাদের সাথে কথা বলুন। আপনার business, budget এবং requirements শুনে আমরা আপনাকে
          suitable solution suggest করব — কোনো চাপ ছাড়াই।
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="#contact-form"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-indigo-50"
          >
            <Send className="size-4" />
            Talk to an Expert
          </Link>
          <Link
            href="https://wa.me/"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-500 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600"
          >
            <MessageCircle className="size-4" />
            WhatsApp / Messenger
          </Link>
          <Link
            href="tel:+880"
            className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <Phone className="size-4" />
            Call Us
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
