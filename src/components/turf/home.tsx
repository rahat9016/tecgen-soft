"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Dumbbell,
  Lock,
  MapPin,
  PartyPopper,
  ShieldCheck,
  Star,
  Trophy,
  Wallet,
} from "lucide-react";
import { formatDuration, hourLabel, sportLabels, taka, todayYmd } from "@/src/lib/turf-store/format";
import { courtLive, endMs, freeSlots, useHydrated, useNow, useTurfDB } from "@/src/lib/turf-store/store";
import type { Sport } from "@/src/lib/turf-store/types";
import { cn } from "@/src/lib/utils";
import QuickBook from "./QuickBook";
import { Chip, LiveBadge, LiveDot, SportIcon, tbtn } from "./ui";

const avatars = [
  { i: "RU", c: "bg-amber-400" },
  { i: "TA", c: "bg-sky-400" },
  { i: "NJ", c: "bg-rose-400" },
  { i: "SH", c: "bg-lime-400" },
];

export function Hero() {
  const { courts } = useTurfDB();
  const active = courts.filter((c) => c.active);
  const [i, setI] = useState(0);
  const court = active[i % Math.max(1, active.length)];

  return (
    <section className="p-2 md:p-3">
      <div className="relative overflow-hidden rounded-[28px] bg-emerald-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/turf/hero.webp" alt="" className="absolute inset-0 size-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/55 to-emerald-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-emerald-950/60" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-28 md:px-8 lg:grid-cols-[1fr_360px] lg:pb-12 lg:pt-32">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Choose Your Turf
              <br />
              Play Your Game.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 md:text-base">
              Book premium sports turfs across the city for Football, Cricket, Badminton and more — check live
              availability and lock your slot with a small advance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/turf/book" className={tbtn.lime}>
                See live slots <ArrowRight className="size-4" />
              </Link>
              <Link href="/turf/my-bookings" className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-white ring-1 ring-white/30 hover:bg-white/10">
                My bookings
              </Link>
            </div>
          </div>
          <QuickBook />

          <div className="flex flex-wrap items-end justify-between gap-6 lg:col-span-2">
            <div>
              <div className="flex -space-x-2.5 rounded-full bg-white/15 p-1 ring-1 ring-white/20 backdrop-blur w-fit">
                {avatars.map((a) => (
                  <span key={a.i} className={cn("flex size-9 items-center justify-center rounded-full text-xs font-bold text-emerald-950 ring-2 ring-emerald-900", a.c)}>
                    {a.i}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-lg font-medium text-lime-400">
                12k + <span className="text-white">Membership</span>
              </p>
              <p className="text-sm text-white/70">Enjoy our facilities</p>
            </div>
            {court && (
              <div className="w-full max-w-xs">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white/90">
                    {(i % active.length) + 1}/{active.length} {court.name}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setI((v) => (v - 1 + active.length) % active.length)} aria-label="Previous court" className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30">
                      <ArrowLeft className="size-4" />
                    </button>
                    <button onClick={() => setI((v) => (v + 1) % active.length)} aria-label="Next court" className="flex size-9 items-center justify-center rounded-full bg-white text-emerald-950 hover:bg-lime-300">
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 h-0.5 rounded bg-white/20">
                  <div className="h-full rounded bg-lime-400 transition-all" style={{ width: `${(((i % active.length) + 1) / active.length) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Real-time strip: what is being played on each court right now and what is next. */
export function LiveNow() {
  const db = useTurfDB();
  const hydrated = useHydrated();
  const now = useNow(1000);
  const courts = db.courts.filter((c) => c.active);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <LiveBadge now={now} />
          <h2 className="mt-3 text-2xl font-semibold text-neutral-900 md:text-3xl">Happening on our courts right now</h2>
        </div>
        <Link href="/turf/book" className={tbtn.outline}>
          Full schedule <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {courts.map((c) => {
          const { current, next } = hydrated ? courtLive(db, c.id, now) : { current: undefined, next: undefined };
          const left = current ? endMs(current) - now : 0;
          const pct = current ? 100 - (left / (current.duration * 3600_000)) * 100 : 0;
          const free = hydrated ? freeSlots(db, c, todayYmd(), now) : null;
          return (
            <Link key={c.id} href={`/turf/book?court=${c.id}`} className="group flex gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition hover:border-emerald-500 hover:shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <SportIcon sport={c.sport} className="size-3.5" /> {sportLabels[c.sport]}
                </div>
                <p className="truncate font-semibold text-neutral-900">{c.name}</p>
                {current ? (
                  <>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <LiveDot className="size-1.5" /> In play · ends in {formatDuration(left)}
                    </p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded bg-neutral-100">
                      <div className="h-full bg-lime-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="mt-1 text-xs font-medium text-emerald-700">{hydrated ? "Free right now" : "Checking…"}</p>
                )}
                <p className="mt-1 truncate text-xs text-neutral-500">
                  {free === null ? " " : `${free} slot${free === 1 ? "" : "s"} left today${next ? ` · next game ${hourLabel(next.startHour)}` : ""}`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 md:px-8">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="text-sm font-medium text-neutral-900">About Us</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-neutral-900 md:text-4xl">
            Empowering Sports Through Innovation and Convenience
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-neutral-600">
          We are more than just a platform — we are a community built for athletes, trainers, event organizers and
          sports enthusiasts. Our mission is to make access to sports easier, more organized and more exciting than
          ever before.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-80 overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/turf/kids.webp" alt="Footballs on an outdoor turf" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/10 to-transparent" />
          <span className="absolute left-5 top-5 rounded-full bg-white/20 px-4 py-1.5 text-sm text-white backdrop-blur">Outdoor</span>
          <Link href="/turf/book" aria-label="Book an outdoor court" className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full bg-white text-emerald-950 hover:bg-lime-300">
            <ArrowUpRight className="size-5" />
          </Link>
          <p className="absolute inset-x-6 bottom-6 text-lg leading-snug text-white md:text-xl">
            Our mission is to make access to sports easier, more organized, and more exciting than ever
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-5">
            {[
              { img: "/turf/badminton.webp", tag: "Indoor" },
              { img: "/turf/night-match.webp", tag: "Night games" },
            ].map((x) => (
              <div key={x.tag} className="relative aspect-square overflow-hidden rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={x.img} alt="" className="absolute inset-0 size-full object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs text-white backdrop-blur">{x.tag}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { v: "10,000+", t: "Games hosted", d: "Proven track record since 2018." },
              { v: "97%", t: "Satisfaction rate", d: "Rated by players after every match." },
              { v: "0", t: "Double bookings", d: "Live slot locking keeps it that way." },
            ].map((s) => (
              <div key={s.t}>
                <p className="text-2xl font-semibold text-neutral-900 md:text-3xl">{s.v}</p>
                <p className="mt-2 text-sm font-medium text-neutral-900">{s.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const services = [
  { icon: CalendarCheck, title: "Slot Booking", text: "Pick a court and time from the live schedule and lock it in a few clicks." },
  { icon: Dumbbell, title: "Training Sessions", text: "Level up with coaching for football, cricket nets and racket sports." },
  { icon: PartyPopper, title: "Event Management", text: "Corporate leagues and birthday matches — we block the courts and run the day." },
  { icon: Trophy, title: "Tournaments", text: "Weekly 5-a-side and box-cricket cups with fixtures and live scores." },
];

export function Services() {
  return (
    <section id="services" className="relative scroll-mt-24 overflow-hidden bg-emerald-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/turf/stadium.webp" alt="" className="absolute inset-0 size-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/70 to-emerald-950" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white ring-1 ring-white/15">Service</span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">Fuel Your Passion with Our Full Service Experience</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              From a one-hour kickabout to a full-day tournament, everything is booked, paid and confirmed online.
            </p>
          </div>
          <Link href="/turf/book" className="inline-flex h-9 items-center rounded-full bg-lime-400 px-4 text-xs font-semibold text-emerald-950 hover:bg-lime-300">
            Book a slot
          </Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="rounded-2xl bg-white p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <s.icon className="size-5" />
              </span>
              <p className="mt-8 font-semibold text-neutral-900">{s.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedCourts() {
  const db = useTurfDB();
  const hydrated = useHydrated();
  const now = useNow(30_000);
  const [sport, setSport] = useState<Sport | "all">("all");
  const courts = db.courts.filter((c) => c.active && (sport === "all" || c.sport === sport));
  const sports = [...new Set(db.courts.filter((c) => c.active).map((c) => c.sport))];

  return (
    <section id="courts" className="scroll-mt-24 bg-neutral-100/70">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="text-center">
          <span className="rounded-full bg-white px-3 py-1 text-xs text-neutral-700 ring-1 ring-neutral-200">Featured Courts</span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-tight text-neutral-900 md:text-4xl">
            Discover top courts with great facilities and prime locations.
          </h2>
        </div>
        <div className="mt-10 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <Chip active={sport === "all"} onClick={() => setSport("all")}>
            All Courts
          </Chip>
          {sports.map((s) => (
            <Chip key={s} active={sport === s} onClick={() => setSport(s)}>
              <SportIcon sport={s} className="size-3.5" /> {sportLabels[s]}
            </Chip>
          ))}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map((c) => {
            const free = hydrated ? freeSlots(db, c, todayYmd(), now) : null;
            return (
              <article key={c.id} className="overflow-hidden rounded-3xl bg-white p-2.5 ring-1 ring-neutral-200">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.name} className="size-full object-cover transition duration-500 hover:scale-105" />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" /> {c.rating}
                  </span>
                  <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur">
                    {c.indoor ? "Indoor" : "Outdoor"}
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <SportIcon sport={c.sport} className="size-3.5" /> {sportLabels[c.sport]} · {c.size}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-neutral-900">{c.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{c.description}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-neutral-900">
                        {taka(c.price)}
                        <span className="text-xs font-normal text-neutral-500"> /hr</span>
                      </p>
                      <p className={cn("text-xs", free === 0 ? "text-rose-600" : "text-emerald-700")}>
                        {free === null ? " " : free === 0 ? "Fully booked today" : `${free} free slots today`}
                      </p>
                    </div>
                    <Link href={`/turf/book?court=${c.id}`} className={tbtn.green}>
                      Book <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { settings } = useTurfDB();
  const steps = [
    { icon: MapPin, title: "Pick court & time", text: "The live schedule shows every free slot. Taken and on-hold slots update instantly." },
    { icon: Lock, title: `Slot held ${settings.holdMinutes} min`, text: "Once you continue, the slot is locked for you while you pay — nobody else can grab it." },
    { icon: Wallet, title: `Pay ${settings.advancePercent}% advance`, text: "Pay the advance with bKash, Nagad or card. Settle the rest at the venue." },
    { icon: ShieldCheck, title: "Get confirmed", text: "Our team verifies the payment and your booking turns Confirmed — live." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <h2 className="max-w-lg text-3xl font-semibold leading-tight text-neutral-900 md:text-4xl">Book in under a minute</h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-3xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-full bg-lime-400 text-emerald-950">
                <s.icon className="size-5" />
              </span>
              <span className="text-4xl font-semibold text-neutral-100">0{i + 1}</span>
            </div>
            <p className="mt-6 font-semibold text-neutral-900">{s.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{s.text}</p>
          </div>
        ))}
      </div>
      <div className="relative mt-12 overflow-hidden rounded-3xl bg-emerald-900 px-6 py-12 md:px-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/turf/night.webp" alt="" className="absolute inset-0 size-full object-cover opacity-25" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold text-white md:text-3xl">Tonight&apos;s prime slots go fast.</h3>
            <p className="mt-2 text-sm text-white/70">
              Peak hours start at {hourLabel(settings.peakStartHour)}. Check what&apos;s left before your squad does.
            </p>
          </div>
          <Link href="/turf/book" className={tbtn.lime}>
            Check live slots <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
