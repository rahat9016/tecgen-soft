import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ArrowRight, BadgePercent, CalendarCheck, Headphones, Lock, ShieldCheck } from "lucide-react";
import HeroSlider from "./HeroSlider";
import SearchWidget from "./SearchWidget";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const trustPoints = [
  { label: "Best Price Guarantee", icon: ShieldCheck },
  { label: "Easy Booking", icon: CalendarCheck },
  { label: "Secure Payment", icon: Lock },
  { label: "24/7 Support", icon: Headphones },
];

export default function Hero() {
  return (
    <section className="relative -mt-(--hotel-header-h)">
      <HeroSlider>
        <div className={`${jakarta.className} container relative flex min-h-[calc(560px+var(--hotel-header-h))] flex-col items-center justify-center pb-36 pt-[calc(var(--hotel-header-h)+3rem)] text-center text-white md:min-h-[calc(640px+var(--hotel-header-h))] md:pb-40`}>
          <a
            href="#deals"
            className="group flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1 pl-1 pr-3 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-2.5 py-1 font-bold">
              <BadgePercent className="size-3.5" /> 40% OFF
            </span>
            <span className="truncate">On selected hotels this week</span>
            <ArrowRight className="size-3.5 shrink-0 transition group-hover:translate-x-0.5" />
          </a>

          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] drop-shadow-md sm:text-5xl md:text-7xl">
            Find The Perfect Stay
            <span className="mt-1 block bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
              For Your Journey
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-100/90 md:text-base">
            Bangladesh&rsquo;s trusted booking platform — 5000+ hotels, resorts and cottages
            with the best price guaranteed and support around the clock.
          </p>

          <div className="mt-7 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/hotel-management/search"
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/30 transition hover:bg-sky-700 sm:w-auto"
            >
              Explore Hotels <ArrowRight className="size-4" />
            </Link>
            <a
              href="#deals"
              className="flex w-full items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto"
            >
              View Today&rsquo;s Deals
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-neutral-100 md:text-sm">
            {trustPoints.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-1.5">
                <Icon className="size-4 text-amber-400" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </HeroSlider>

      <div className="container relative z-10 -mt-20">
        <SearchWidget />
      </div>
    </section>
  );
}
