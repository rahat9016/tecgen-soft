"use client";

import { useState, type FormEvent } from "react";
import { BadgePercent, BellRing, CheckCircle2, Mail, MapPinned, Send, Sparkles } from "lucide-react";
import { hotel } from "@/src/data/hotels";

const perks = [
  { icon: BadgePercent, text: "Seasonal room deals before anyone else" },
  { icon: BellRing, text: "Alerts when our suites have open dates" },
  { icon: MapPinned, text: `Local tips for ${hotel.location}` },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "invalid" | "done">("idle");

  // No mailing-list service is connected yet; this only confirms the address on screen.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus(EMAIL.test(email.trim()) ? "done" : "invalid");
  };

  return (
    <section className="container py-12">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-sky-950 shadow-2xl shadow-sky-950/20">
        <img
          src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1800&q=80&auto=format&fit=crop"
          alt=""
          aria-hidden
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-950 via-sky-950/85 to-sky-950/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-sky-950/70 via-transparent to-transparent lg:hidden" />

        <svg
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-24 w-full text-sky-300"
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
        >
          <path d="M0 60 C 240 30 480 90 720 60 S 1200 30 1440 58" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
          <path d="M0 80 C 260 55 500 105 760 78 S 1220 52 1440 76" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
        </svg>

        <div className="grid items-center gap-10 px-6 py-10 sm:px-10 md:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
          <div className="text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
              <Sparkles className="size-3.5" /> Sea Paradise insiders
            </span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
              Get our best offers
              <span className="block bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent">
                straight to your inbox
              </span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-sky-100/90 md:text-base">
              One short email a month — deals, open dates and things to do by the beach. No spam, ever.
            </p>

            <ul className="mt-6 space-y-3">
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-sky-50">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300 ring-1 ring-white/15">
                    <Icon className="size-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/25 bg-white/10 p-5 shadow-2xl shadow-sky-950/30 backdrop-blur-xl sm:p-6">
            {status === "done" ? (
              <div className="flex flex-col items-center py-4 text-center text-white" role="status">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-300/30">
                  <CheckCircle2 className="size-7" />
                </span>
                <p className="mt-4 text-lg font-bold">You&rsquo;re on the list!</p>
                <p className="mt-1 text-sm text-sky-100/80">
                  We&rsquo;ll send our next offer to <span className="font-semibold text-white">{email.trim()}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("");
                    setStatus("idle");
                  }}
                  className="mt-4 text-sm font-semibold text-amber-300 hover:underline"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="newsletter-email" className="text-sm font-semibold text-white">
                  Your email address
                </label>
                <div
                  className={`mt-2 flex items-center gap-2 rounded-2xl bg-white p-1.5 pl-4 shadow-lg ring-2 transition focus-within:ring-amber-300 ${
                    status === "invalid" ? "ring-rose-400" : "ring-transparent"
                  }`}
                >
                  <Mail className="size-5 shrink-0 text-neutral-400" />
                  <input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "invalid") setStatus("idle");
                    }}
                    placeholder="you@example.com"
                    aria-invalid={status === "invalid"}
                    aria-describedby="newsletter-hint"
                    className="h-11 min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                  />
                  <button
                    type="submit"
                    className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-4 text-sm font-bold text-neutral-900 shadow-md shadow-orange-500/20 transition hover:from-amber-300 hover:to-orange-300 sm:px-5"
                  >
                    <span className="hidden sm:inline">Subscribe</span>
                    <Send className="size-4" />
                  </button>
                </div>
                <p
                  id="newsletter-hint"
                  className={`mt-2 text-xs ${status === "invalid" ? "text-rose-300" : "text-sky-100/70"}`}
                >
                  {status === "invalid"
                    ? "Please enter a valid email address."
                    : "Unsubscribe anytime with one click."}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
