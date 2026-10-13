"use client";

import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import {
  ArrowUpRight,
  Check,
  Facebook,
  Hotel,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Shirt,
  Smartphone,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { CONTACT } from "@/src/lib/contact";
import { SOLUTIONS } from "@/src/lib/solutions";

const productStyle: Record<string, { icon: LucideIcon; accent: string }> = {
  "hotel-booking": { icon: Hotel, accent: "from-sky-400 to-blue-600" },
  "gadget-ecommerce": {
    icon: Smartphone,
    accent: "from-indigo-400 to-[#3D2EF9]",
  },
  ecommerce: { icon: Shirt, accent: "from-pink-400 to-rose-500" },
  "turf-booking": { icon: Trophy, accent: "from-emerald-400 to-green-600" },
};
const OTHER = "অন্য কিছু";

const promises = [
  "কোনো upfront বা setup খরচ নেই",
  "Website live হওয়ার পর payment শুরু",
  "যেকোনো মাসে cancel",
];

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us",
    href: CONTACT.whatsappHref,
    accent: "bg-emerald-500 text-white",
  },
  {
    icon: Phone,
    label: "Call",
    value: CONTACT.phoneDisplay,
    href: CONTACT.phoneHref,
    accent: "bg-white/15 text-white",
  },
  {
    icon: Mail,
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    accent: "bg-white/15 text-white",
  },
  {
    icon: Facebook,
    label: "Facebook",
    value: "Message our Page",
    href: CONTACT.facebookHref,
    accent: "bg-white/15 text-white",
  },
];

const emptyForm = {
  name: "",
  phone: "",
  business: "",
  message: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/35 transition outline-none [color-scheme:dark] focus:border-indigo-300/60 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-400/15";

export default function FinalCta() {
  const [form, setForm] = useState(emptyForm);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const selected = SOLUTIONS.find((s) => s.name === form.business);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return void toast.error("আপনার নাম লিখুন।");
    if (form.phone.replace(/\D/g, "").length < 11)
      return void toast.error("সঠিক ফোন নম্বর দিন (যেমন 01XXXXXXXXX)।");

    const text = [
      "Hello Tecgen Soft! আমি subscription নিয়ে কথা বলতে চাই।\n",
      `নাম: ${form.name.trim()}`,
      `ফোন: ${form.phone.trim()}`,
      form.business &&
        `যে product চাই: ${form.business}${selected ? ` (${selected.price}/মাস)` : ""}`,
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
    <section id="contact" className="relative overflow-x-clip py-10 sm:py-16 md:py-24">
      <div className="pointer-events-none absolute top-1/4 -left-32 size-[30rem] rounded-full bg-[#3D2EF9]/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-24 size-[28rem] rounded-full bg-white/[0.05] blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-8">
        <Reveal>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-neutral-200">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Get Started
          </span>
          <h2 className="mt-5 text-3xl leading-tight font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            আপনার website live করুন{" "}
            <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
              মাত্র ১–৩ দিনে
            </span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-neutral-300">
            Product বেছে নিন, তথ্য দিন — বাকি সব আমরা করব। Setup থেকে hosting,
            updates ও support পর্যন্ত সবকিছু একটাই মাসিক fee-তে।
          </p>

          <ul className="mt-6 space-y-2.5">
            {promises.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-sm text-neutral-200"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-7 text-xs font-semibold sm:mt-9 tracking-wide text-neutral-500 uppercase">
            অথবা সরাসরি কথা বলুন
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {channels.map(({ icon: Icon, label, value, href, accent }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="glass group flex items-center gap-3 rounded-2xl p-3.5 transition hover:border-white/25 hover:bg-white/[0.1]"
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accent}`}
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
            className="glass-strong rounded-3xl p-5 sm:p-8"
          >
            <form onSubmit={handleSubmit} noValidate>
              <h3 className="text-xl font-bold text-white">
                Subscription শুরু করুন
              </h3>
              <p className="mt-1 text-sm text-neutral-400">
                তথ্য দিন — WhatsApp-এ সরাসরি আমাদের কাছে পৌঁছাবে।
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-neutral-200">
                    আপনার নাম <span className="text-rose-400">*</span>
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
                  <span className="mb-1.5 block text-xs font-semibold text-neutral-200">
                    ফোন নম্বর <span className="text-rose-400">*</span>
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
                <legend className="mb-2 text-xs font-semibold text-neutral-200">
                  কোন product চান?
                </legend>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {SOLUTIONS.map(({ slug, name, price }) => {
                    const { icon: Icon, accent } =
                      productStyle[slug] ?? productStyle.ecommerce;
                    const active = form.business === name;
                    return (
                      <button
                        key={slug}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update("business")(active ? "" : name)}
                        className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-indigo-300/60 bg-indigo-500/15 ring-1 ring-indigo-300/30"
                            : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                        }`}
                      >
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${accent} text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)]`}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm leading-snug font-semibold text-white">
                            {name}
                          </span>
                          <span className="block text-xs text-neutral-400">
                            <span className="font-semibold text-indigo-300">
                              {price}
                            </span>
                            /মাস
                          </span>
                        </span>
                        {active && (
                          <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-[#3D2EF9] text-white ring-2 ring-[#0a0a0a]">
                            <Check className="size-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  aria-pressed={form.business === OTHER}
                  onClick={() =>
                    update("business")(form.business === OTHER ? "" : OTHER)
                  }
                  className={`mt-2.5 w-full rounded-xl border border-dashed px-3 py-2 text-sm transition ${
                    form.business === OTHER
                      ? "border-indigo-300/60 bg-indigo-500/15 text-white"
                      : "border-white/15 text-neutral-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  অন্য কিছু দরকার
                </button>
              </fieldset>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-xs font-semibold text-neutral-200">
                  আর কিছু জানাতে চান?{" "}
                  <span className="font-normal text-neutral-500">
                    (optional)
                  </span>
                </span>
                <textarea
                  value={form.message}
                  onChange={(e) => update("message")(e.target.value)}
                  rows={3}
                  placeholder="যেমন: business-এর নাম, domain আছে কি না, বিশেষ কোনো feature..."
                  className={`${inputClass} resize-none`}
                />
              </label>

              <button
                type="submit"
                className="group mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-base font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_14px_32px_-10px_rgba(16,185,129,0.7)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                <Send className="size-4 transition group-hover:translate-x-0.5" />
                WhatsApp-এ পাঠান
              </button>
              <p className="mt-3 text-center text-xs text-neutral-500">
                আপনার তথ্য শুধু আপনার সাথে যোগাযোগের জন্য ব্যবহার হবে।
              </p>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
