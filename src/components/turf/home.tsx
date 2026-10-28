"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Lock,
  Phone,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { GiSoccerBall } from "react-icons/gi";
import { formatDuration, hourLabel, taka } from "@/src/lib/turf-store/format";
import { courtLive, endMs, groundOf, useHydrated, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import { useT } from "@/src/lib/turf-store/i18n";
import QuickBook from "./QuickBook";
import { LiveDot, tbtn } from "./ui";

const useGround = () => groundOf(useTurfDB());

export function Hero() {
  const { settings, content } = useTurfDB();
  const ground = useGround();
  const tr = useT();
  const facts = [
    {
      icon: GiSoccerBall,
      v: ground ? tr("{format} ground", { format: tr(ground.size.split(" · ")[0]) }) : tr("Football ground"),
      t: ground ? `${ground.size.split(" · ")[1] ?? ""} · ${tr(ground.players)}` : "",
    },
    { icon: Clock, v: `${hourLabel(settings.openHour)} – ${hourLabel(settings.closeHour)}`, t: tr("Open every day") },
    { icon: Wallet, v: tr("{n}% advance", { n: settings.advancePercent }), t: tr("bKash, Nagad or card — rest at the venue") },
    { icon: ShieldCheck, v: tr("Free cancellation"), t: tr("Up to {n} hours before kick-off", { n: settings.cancelCutoffHours }) },
  ];

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-emerald-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={content.heroImage} alt="" className="absolute inset-0 size-full object-cover object-[70%_center]" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/55 to-emerald-950/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-emerald-950/60" />

      {/* Fills the viewport: content centred, facts row pinned to the bottom. On mobile only the slot picker shows. */}
      <div className="relative mx-auto grid w-full max-w-7xl flex-1 gap-10 px-4 pb-10 pt-28 max-md:content-start md:px-8 lg:grid-cols-[1fr_440px] lg:grid-rows-[1fr_auto] lg:items-center lg:pb-12 lg:pt-28">
        <div className="flex flex-col justify-center max-md:contents">
          <h1 className="max-md:sr-only whitespace-pre-line text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {tr(content.heroTitle)}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 max-md:hidden md:text-base">{tr(content.heroText)}</p>
          <div className="mt-8 flex flex-wrap gap-3 max-md:hidden">
            <Link href="/turf/book" className={tbtn.lime}>
              {tr("See live slots")} <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-white ring-1 ring-white/30 hover:bg-white/10"
            >
              {tr("How booking works")}
            </a>
          </div>
        </div>
        <QuickBook />

        <ul className="grid gap-3 border-t border-white/15 pt-6 max-md:hidden sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
          {facts.map((f) => (
            <li key={f.v} className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-lime-400 ring-1 ring-white/15">
                <f.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{f.v}</p>
                <p className="text-xs text-white/70">{f.t}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The one ground: photo with live status, pitch drawing + spec sheet. */
export function Ground() {
  const db = useTurfDB();
  const ground = useGround();
  const hydrated = useHydrated();
  const now = useNow(1000);
  const tr = useT();
  if (!ground) return null;

  const { settings } = db;
  const { current, next } = hydrated ? courtLive(db, ground.id, now) : { current: undefined, next: undefined };
  const left = current ? endMs(current) - now : 0;
  const pct = current ? 100 - (left / (current.duration * 3600_000)) * 100 : 0;
  const [format, dims] = ground.size.split(" · ");

  const specs = [
    { k: tr("Surface"), v: tr(ground.surface) },
    { k: tr("Squad size"), v: `${tr(format)} · ${tr(ground.players)}` },
    { k: tr("Hours"), v: tr("{from} – {to}, every day", { from: hourLabel(settings.openHour), to: hourLabel(settings.closeHour) }) },
    { k: tr("On site"), v: ground.features.map((f) => tr(f)).join(", ") },
    { k: tr("Player rating"), v: `${ground.rating} / 5` },
  ];

  return (
    <section id="ground" className="scroll-mt-24 bg-neutral-100/70">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-emerald-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ground.image} alt={ground.name} className="size-full object-cover" />
              {current && <div className="absolute inset-x-0 bottom-0 h-1 bg-lime-400 transition-all" style={{ width: `${pct}%` }} />}
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium text-neutral-900">
                {current ? (
                  <>
                    <LiveDot /> {tr("Match in play — {time} left", { time: formatDuration(left) })}
                  </>
                ) : (
                  <>
                    <span className="size-2 rounded-full bg-neutral-400" /> {hydrated ? tr("Pitch is free right now") : tr("Checking…")}
                  </>
                )}
              </span>
              <span className="text-neutral-500">{next ? tr("Next game {time}", { time: hourLabel(next.startHour) }) : tr("No more games today")}</span>
            </figcaption>
          </figure>

          <div>
            <PitchPlan dims={dims} />
            <dl className="mt-6 divide-y divide-neutral-300 border-y border-neutral-300 text-sm">
              {specs.map((x) => (
                <div key={x.k} className="grid grid-cols-[120px_1fr] gap-4 py-3">
                  <dt className="text-neutral-500">{x.k}</dt>
                  <dd className="text-neutral-900">{x.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Top-down drawing of the pitch with its dimensions, like a groundsman's plan. */
function PitchPlan({ dims }: { dims?: string }) {
  const [length, width] = (dims ?? "").replace(/ ft$/, "").split(" × ");
  const tr = useT();
  return (
    <div className="rounded-2xl bg-emerald-900 p-5">
      <svg viewBox="0 0 234 120" className="w-full text-white/80" fill="none" aria-label={dims ? `${tr("Pitch plan")}, ${dims}` : tr("Pitch plan")}>
        <g stroke="currentColor" strokeWidth="1">
          <rect x="10" y="14" width="200" height="96" />
          <path d="M110 14V110" />
          <circle cx="110" cy="62" r="14" />
          <path d="M10 38H34V86H10M210 38H186V86H210" />
          <path d="M10 50H18V74H10M210 50H202V74H210" />
          <path d="M6 54V70M214 54V70" strokeWidth="2" />
        </g>
        <circle cx="110" cy="62" r="1.5" fill="currentColor" />
        {length && (
          <g className="fill-lime-300 text-[7px]" stroke="none">
            <path d="M10 6H210" stroke="currentColor" strokeOpacity=".4" strokeDasharray="2 2" />
            <text x="110" y="8.5" textAnchor="middle" className="fill-lime-300" style={{ paintOrder: "stroke" }} stroke="#064e3b" strokeWidth="4">
              {length} {tr("ft")}
            </text>
          </g>
        )}
        {width && (
          <text x="226" y="62" textAnchor="middle" transform="rotate(90 226 62)" className="fill-lime-300 text-[7px]">
            {width} {tr("ft")}
          </text>
        )}
      </svg>
    </div>
  );
}

export function Gallery() {
  const { gallery } = useTurfDB();
  const photos = gallery.filter((g) => g.visible);
  const tr = useT();
  if (!photos.length) return null;

  return (
    <section id="gallery" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 md:px-8 md:py-20">
      <h2 className="text-fluid-4xl font-semibold text-neutral-900">{tr("Life on the pitch")}</h2>
      <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {photos.map((g) => (
          <li key={g.id} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={g.src}
              alt={tr(g.title)}
              loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
            />
            {g.title && (
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 text-xs font-medium text-white md:text-sm">{tr(g.title)}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

const players = [
  { who: "Weekend squads", what: "Same group, same slot every week — book your regular time well ahead and pay the advance in seconds." },
  { who: "Office teams", what: "After-work matches and corporate leagues. Need the whole evening? We block the ground for you." },
  { who: "Kids & coaching", what: "Morning sessions on a soft, shock-padded surface, with a coach on request." },
];

export function About() {
  const { settings, content } = useTurfDB();
  const tr = useT();
  const facts = [
    { v: tr("{n} hrs", { n: settings.closeHour - settings.openHour }), t: tr("Open every day"), d: tr("{from} to {to}", { from: hourLabel(settings.openHour), to: hourLabel(settings.closeHour) }) },
    { v: hourLabel(settings.closeHour), t: tr("Floodlights until"), d: tr("Full LED lighting for night games") },
    { v: tr("{n} min", { n: settings.holdMinutes }), t: tr("Slot held while you pay"), d: tr("Nobody can take it mid-checkout") },
    { v: tr("{n} days", { n: settings.bookingWindowDays }), t: tr("Book ahead"), d: tr("Lock your regular slot early") },
  ];

  return (
    <section id="about" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 md:px-8 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <h2 className="whitespace-pre-line text-fluid-5xl font-semibold tracking-tight text-neutral-900">{tr(content.aboutTitle)}</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-600">{tr(content.aboutText)}</p>

          <ul className="mt-8 border-t border-neutral-200 md:mt-10">
            {players.map((p, i) => (
              <li key={p.who} className="grid grid-cols-[2.5rem_1fr] gap-x-2 border-b border-neutral-200 py-5">
                <span className="pt-0.5 text-sm tabular-nums text-neutral-400">0{i + 1}</span>
                <div>
                  <p className="font-semibold text-neutral-900">{tr(p.who)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">{tr(p.what)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4 self-start">
          <figure className="mt-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/turf/player.webp" alt={tr("Player striking the ball on the turf")} className="aspect-[3/4] w-full rounded-2xl object-cover" />
            <figcaption className="mt-3 text-sm text-neutral-500">
              <span className="font-medium text-neutral-900">{tr("By day")}</span> — {tr("FIFA-grade grass with a true roll.")}
            </figcaption>
          </figure>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/turf/night-match.webp" alt={tr("Night match under floodlights")} className="aspect-[3/4] w-full rounded-2xl object-cover" />
            <figcaption className="mt-3 text-sm text-neutral-500">
              <span className="font-medium text-neutral-900">{tr("After dark")}</span> — {tr("floodlit until {time}.", { time: hourLabel(settings.closeHour) })}
            </figcaption>
          </figure>
        </div>
      </div>

      <dl className="mt-10 grid grid-cols-2 border-t border-neutral-900 md:mt-16 lg:grid-cols-4">
        {facts.map((f, i) => (
          <div key={f.t} className={`py-6 pr-4 ${i > 0 ? "lg:border-l lg:border-neutral-200 lg:pl-6" : ""} ${i % 2 === 1 ? "border-l border-neutral-200 pl-4 lg:pl-6" : ""}`}>
            <dd className="text-fluid-4xl font-semibold tracking-tight text-neutral-900">{f.v}</dd>
            <dt className="mt-2 text-sm font-medium text-neutral-900">{f.t}</dt>
            <p className="mt-0.5 text-sm text-neutral-500">{f.d}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Services() {
  const { settings, content } = useTurfDB();
  const ground = useGround();
  const tr = useT();
  const tel = `tel:${settings.phone.replace(/[^+\d]/g, "")}`;
  const services = content.services.map((x) => ({
    ...x,
    title: tr(x.title),
    text: tr(x.text),
    detail: x.detail ? tr(x.detail) : x.online ? (ground ? tr("From {amount}/hr", { amount: taka(ground.price) }) : tr("Book online")) : "",
    href: x.online ? "/turf/book" : tel,
    cta: x.online ? tr("Book") : tr("Call to arrange"),
  }));
  if (!services.length) return null;

  return (
    <section id="services" className="scroll-mt-24 bg-emerald-950">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-24">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <h2 className="whitespace-pre-line text-fluid-5xl font-semibold tracking-tight text-white">{tr("More than an hour\non the pitch.")}</h2>
          <p className="max-w-md text-base leading-relaxed text-white/60 lg:justify-self-end">
            {tr("Book a kickabout online in a minute. For coaching, events or a tournament, give us a call and we'll set it up.")}
          </p>
        </div>

        <ul className="mt-8 border-t border-white/15 md:mt-14">
          {services.map((x, i) => {
            const external = x.href.startsWith("tel:");
            const Row = external ? "a" : Link;
            return (
              <li key={i} className="border-b border-white/15">
                <Row
                  href={x.href}
                  className="group relative isolate grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-2 px-2 py-7 md:grid-cols-[3.5rem_1fr_1.4fr_10rem_3rem] md:px-4 lg:grid-cols-[3.5rem_1fr_1.4fr_10rem_11rem]"
                >
                  {/* Lime sweep on hover */}
                  <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-lime-400 transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                  <span className="text-sm tabular-nums text-white/40 transition-colors duration-300 group-hover:text-emerald-950/60">0{i + 1}</span>
                  <span className="text-fluid-3xl font-semibold text-white transition-colors duration-300 group-hover:text-emerald-950">{x.title}</span>
                  <span className="col-start-2 row-start-2 text-sm leading-relaxed text-white/60 transition-colors duration-300 group-hover:text-emerald-950/80 md:col-start-auto md:row-start-auto">
                    {x.text}
                  </span>
                  <span className="hidden text-sm font-medium text-lime-300 transition-colors duration-300 group-hover:text-emerald-950 md:block">{x.detail}</span>
                  <span className="col-start-3 row-span-2 row-start-1 flex items-center gap-3 md:col-start-auto md:row-span-1 md:row-start-auto md:justify-end">
                    <span className="hidden text-sm font-medium text-white/70 transition-colors duration-300 group-hover:text-emerald-950 lg:inline">{x.cta}</span>
                    <span className="flex size-11 items-center justify-center rounded-full ring-1 ring-white/25 transition duration-300 group-hover:bg-emerald-950 group-hover:ring-emerald-950">
                      {external ? (
                        <Phone className="size-4 text-white" />
                      ) : (
                        <ArrowRight className="size-4 -rotate-45 text-white transition-transform duration-300 group-hover:rotate-0" />
                      )}
                    </span>
                  </span>
                </Row>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { settings } = useTurfDB();
  const tr = useT();
  const steps = [
    {
      icon: MapPin,
      title: tr("Pick date & time"),
      text: tr("Open Live Slots and choose a day. You see right away which start times are free and which are taken."),
    },
    {
      icon: Lock,
      title: tr("Slot held for {n} min", { n: settings.holdMinutes }),
      text: tr("Enter your name and mobile number. While you pay, the slot is locked for you — nobody else can grab it."),
    },
    {
      icon: Wallet,
      title: tr("Pay {n}% advance", { n: settings.advancePercent }),
      text: tr("Pay the advance with bKash, Nagad or card. The rest is paid in cash or bKash at the venue."),
    },
    {
      icon: ShieldCheck,
      title: tr("Get confirmed & play"),
      text: tr("Your booking is confirmed the moment you pay. Find it any time under My Bookings with your phone number."),
    },
  ];
  return (
    <section
      id="how-it-works"
      className="mx-auto grid max-w-7xl scroll-mt-24 gap-x-4 gap-y-8 px-4 py-12 sm:grid-cols-[1fr_auto] sm:items-end md:gap-y-10 md:px-8 md:py-20"
    >
      <h2 className="max-w-xl text-fluid-4xl font-semibold text-neutral-900">{tr("How to book your turf")}</h2>
      {/* Phones: full-width button after the steps, once they've been read. */}
      <Link href="/turf/book" className={`${tbtn.green} max-sm:order-last max-sm:h-12 max-sm:w-full`}>
        {tr("Start booking")} <ArrowRight className="size-4" />
      </Link>
      <ol className="grid gap-5 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="group flex flex-col rounded-3xl border border-neutral-200 bg-white p-5 transition duration-500 hover:-translate-y-1 hover:border-emerald-900 hover:bg-emerald-950 hover:shadow-xl hover:shadow-emerald-950/20 motion-reduce:hover:translate-y-0"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-full bg-lime-400 text-emerald-950 transition duration-500 group-hover:rotate-[360deg] motion-reduce:group-hover:rotate-0">
                <s.icon className="size-5" />
              </span>
              <span className="text-3xl font-semibold text-neutral-200 transition duration-500 group-hover:text-lime-400/40">0{i + 1}</span>
            </div>
            <p className="mt-4 font-semibold text-neutral-900 transition-colors duration-500 group-hover:text-white">{s.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-500 transition-colors duration-500 group-hover:text-white/70">{s.text}</p>
            {/* Own row at the bottom so it never sits under the text; mt-auto keeps equal card padding. */}
            <PitchLines className="mt-auto pt-3" />
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PrimeTimeCta() {
  const { settings } = useTurfDB();
  const tr = useT();
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8 md:pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-emerald-900 px-6 py-10 md:px-14 md:py-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/turf/night.webp" alt="" className="absolute inset-0 size-full object-cover opacity-25" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <h3 className="text-fluid-5xl font-semibold text-white">{tr("Tonight's prime slots go fast.")}</h3>
            <p className="mt-3 text-sm text-white/70 md:text-base">
              {tr("Peak hours start at {time}. Check what's left before your squad does.", { time: hourLabel(settings.peakStartHour) })}
            </p>
          </div>
          <Link href="/turf/book" className={tbtn.lime}>
            {tr("Check live slots")} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Strip of penalty-box markings along the bottom of each step card. On hover the lines redraw in lime
 * and the ball rolls along the pitch to the penalty spot.
 */
function PitchLines({ className }: { className?: string }) {
  const draw = "[stroke-dasharray:1] motion-safe:group-hover:[animation:pitch-draw_0.9s_ease-out_both]";
  return (
    <div className={className}>
      <svg
        viewBox="0 0 240 64"
        fill="none"
        aria-hidden
        className="h-16 w-full text-emerald-900/15 transition-colors duration-500 group-hover:text-lime-400/60"
      >
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          {/* Goal line, penalty box, six-yard box and arc */}
          <path pathLength={1} className={draw} d="M238 2V62" />
          <path pathLength={1} className={draw} d="M238 8H178V56H238" />
          <path pathLength={1} className={draw} d="M238 20H216V44H238" />
          <path pathLength={1} className={draw} d="M178 22a14 14 0 0 0 0 20" />
        </g>
        <circle cx="198" cy="32" r="1.8" fill="currentColor" />
        {/* Ball: starts on the left, rolls to the penalty spot on hover. */}
        <g className="transition-transform duration-700 ease-out [transform-box:fill-box] [transform-origin:center] motion-safe:group-hover:translate-x-[176px] motion-safe:group-hover:rotate-[540deg]">
          <circle cx="22" cy="32" r="7" fill="currentColor" />
          <path d="M22 27.5l3.8 2.8-1.5 4.4h-4.6l-1.5-4.4z" fill="white" fillOpacity="0.8" />
        </g>
      </svg>
    </div>
  );
}
