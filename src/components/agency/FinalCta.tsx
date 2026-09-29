"use client";

import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import {
  ArrowUpRight,
  Facebook,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { CONTACT } from "@/src/lib/contact";

const businessTypes = [
  "E-commerce",
  "Hotel Booking",
  "Restaurant",
  "Business Website",
  "অন্য কিছু",
];
const budgets = [
  "৳১০,০০০-এর কম",
  "৳১০,০০০ – ৳২০,০০০",
  "৳২০,০০০+",
  "এখনো ঠিক করিনি",
];

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us",
    href: CONTACT.whatsappHref,
    accent: "bg-emerald-500",
  },
  {
    icon: Phone,
    label: "Call",
    value: CONTACT.phoneDisplay,
    href: CONTACT.phoneHref,
    accent: "bg-white/15",
  },
  {
    icon: Mail,
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    accent: "bg-white/15",
  },
  {
    icon: Facebook,
    label: "Facebook",
    value: "Message our Page",
    href: CONTACT.facebookHref,
    accent: "bg-white/15",
  },
];

const emptyForm = {
  name: "",
  phone: "",
  business: "",
  budget: "",
  message: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

export default function FinalCta() {
  const [form, setForm] = useState(emptyForm);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return void toast.error("আপনার নাম লিখুন।");
    if (form.phone.replace(/\D/g, "").length < 11)
      return void toast.error("সঠিক ফোন নম্বর দিন (যেমন 01XXXXXXXXX)।");

    const text = [
      "Hello Tecgen Soft! আমি একটি website নিয়ে কথা বলতে চাই।\n",
      `নাম: ${form.name.trim()}`,
      `ফোন: ${form.phone.trim()}`,
      form.business && `ব্যবসার ধরন: ${form.business}`,
      form.budget && `বাজেট: ${form.budget}`,
      form.message.trim() && `বিস্তারিত: ${form.message.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `${CONTACT.whatsappHref}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
    toast.success("WhatsApp-এ আপনার message তৈরি হয়েছে — Send চাপুন।");
    setForm(emptyForm);
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-linear-to-br from-[#3D2EF9] via-[#4732e8] to-[#061531] py-16 md:py-24"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-indigo-400/30 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-blue-500/20 blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur-sm">
            আজই শুরু করুন
          </span>
          <h2 className="mt-5 text-3xl leading-tight font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            আপনার ব্যবসাকে অনলাইনে নতুনভাবে উপস্থাপন করুন
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-indigo-100">
            আমাদের সাথে কথা বলুন। আপনার business, budget এবং requirements শুনে
            আমরা আপনাকে suitable solution suggest করব — কোনো চাপ ছাড়াই।
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {channels.map(({ icon: Icon, label, value, href, accent }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-3.5 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/[0.12]"
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-white ${accent}`}
                >
                  <Icon className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] tracking-wide text-indigo-200 uppercase">
                    {label}
                  </span>
                  <span className="block truncate text-sm font-semibold text-white">
                    {value}
                  </span>
                </span>
                <ArrowUpRight className="size-4 text-indigo-200 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            id="contact-form"
            className="rounded-3xl bg-white p-6 shadow-2xl shadow-black/25 sm:p-8"
          >
            <form onSubmit={handleSubmit} noValidate>
              <h3 className="text-xl font-bold text-slate-900">
                Free Consultation নিন
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                তথ্য দিন — WhatsApp-এ সরাসরি আমাদের কাছে পৌঁছাবে।
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    আপনার নাম <span className="text-rose-500">*</span>
                  </span>
                  <input
                    value={form.name}
                    onChange={(e) => update("name")(e.target.value)}
                    placeholder="যেমন: রাহাত হোসেন"
                    autoComplete="name"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    ফোন নম্বর <span className="text-rose-500">*</span>
                  </span>
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone")(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className={inputClass}
                  />
                </label>
              </div>

              <fieldset className="mt-5">
                <legend className="mb-2 text-xs font-semibold text-slate-700">
                  ব্যবসার ধরন
                </legend>
                <div className="flex flex-wrap gap-2">
                  {businessTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={form.business === type}
                      onClick={() =>
                        update("business")(form.business === type ? "" : type)
                      }
                      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                        form.business === type
                          ? "border-[#3D2EF9] bg-[#3D2EF9] text-white"
                          : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  আনুমানিক বাজেট
                </span>
                <select
                  value={form.budget}
                  onChange={(e) => update("budget")(e.target.value)}
                  className={`${inputClass} ${form.budget ? "" : "text-slate-400"}`}
                >
                  <option value="">বাছাই করুন (optional)</option>
                  {budgets.map((b) => (
                    <option key={b} value={b} className="text-slate-900">
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  কী ধরনের website চান?
                </span>
                <textarea
                  value={form.message}
                  onChange={(e) => update("message")(e.target.value)}
                  rows={3}
                  placeholder="সংক্ষেপে লিখুন — কী কী feature দরকার, কবের মধ্যে চান..."
                  className={`${inputClass} resize-none`}
                />
              </label>

              <button
                type="submit"
                className="group mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                <Send className="size-4 transition group-hover:translate-x-0.5" />
                WhatsApp-এ পাঠান
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">
                আপনার তথ্য শুধু আপনার সাথে যোগাযোগের জন্য ব্যবহার হবে।
              </p>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
