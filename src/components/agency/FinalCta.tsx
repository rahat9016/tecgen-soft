import Link from "next/link";
import { MessageCircle, Phone, Send } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { CONTACT } from "@/src/lib/contact";

export default function FinalCta() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-linear-to-br from-[#3D2EF9] via-[#4732e8] to-[#061531] py-16 md:py-24"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-indigo-400/30 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-blue-500/20 blur-[100px]" />

      <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur-sm">
          আজই শুরু করুন
        </span>
        <h2 className="mt-5 text-3xl leading-tight font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          আপনার ব্যবসাকে অনলাইনে
          <br className="hidden sm:block" /> নতুনভাবে উপস্থাপন করুন
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-indigo-100">
          আমাদের সাথে কথা বলুন। আপনার business, budget এবং requirements শুনে আমরা আপনাকে
          suitable solution suggest করব — কোনো চাপ ছাড়াই।
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="#contact-form"
            className="inline-flex h-14 items-center gap-2 rounded-xl bg-white px-7 text-base font-semibold text-indigo-700 shadow-xl shadow-black/10 transition hover:bg-indigo-50"
          >
            <Send className="size-4" />
            Talk to an Expert
          </Link>
          <Link
            href={CONTACT.whatsappHref}
            className="inline-flex h-14 items-center gap-2 rounded-xl bg-emerald-500 px-7 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-600"
          >
            <MessageCircle className="size-4" />
            WhatsApp / Messenger
          </Link>
          <Link
            href={CONTACT.phoneHref}
            className="inline-flex h-14 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <Phone className="size-4" />
            Call Us
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
