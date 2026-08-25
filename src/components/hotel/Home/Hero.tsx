import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SearchWidget from "./SearchWidget";

export default function Hero() {
  return (
    <section className="relative">
      <div
        className="relative h-[460px] bg-cover bg-center md:h-[520px]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80&auto=format&fit=crop)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/55 to-neutral-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-neutral-950/30" />

        <div className="container relative flex h-full flex-col justify-center py-10 text-white">
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-300 backdrop-blur-sm">
            Bangladesh&rsquo;s Trusted Booking Marketplace
          </span>

          <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight drop-shadow-md md:text-6xl">
            Find The Perfect Stay
          </h1>
          <p className="mt-1 max-w-lg font-serif text-2xl italic text-amber-400 drop-shadow-md md:text-3xl">
            For Your Journey
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-100 drop-shadow-sm md:text-base">
            Book from 5000+ hotels, resorts and cottages across Bangladesh — best price
            guaranteed, secure payment, support around the clock.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/hotel-management/search"
              className="flex items-center gap-1.5 rounded-md bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-sky-700"
            >
              Explore Hotels <ArrowRight className="size-4" />
            </Link>
            <a
              href="#deals"
              className="rounded-md border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20"
            >
              View Today&rsquo;s Deals
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-neutral-100 drop-shadow-sm">
            <span>🛡️ Best Price Guarantee</span>
            <span>🧳 Easy Booking</span>
            <span>🔒 Secure Payment</span>
            <span>🎧 24/7 Support</span>
          </div>
        </div>

        <div className="absolute right-4 top-6 flex flex-col items-center md:right-10">
          <span className="rounded-t-md bg-violet-700 px-3 py-1 text-[10px] font-bold tracking-wide text-white">
            SPECIAL OFFER
          </span>
          <div className="flex flex-col items-center gap-1 rounded-2xl rounded-tl-none bg-gradient-to-br from-rose-600 to-orange-500 px-6 py-4 text-center text-white shadow-lg">
            <span className="text-xs font-medium">Up to</span>
            <span className="text-3xl font-extrabold leading-none">40% OFF</span>
            <span className="text-xs font-medium">On Selected Hotels</span>
            <button className="mt-1 rounded-md bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white">
              Book Now
            </button>
          </div>
        </div>
      </div>

      <div className="container relative z-10 -mt-20 md:-mt-20">
        <SearchWidget />
      </div>
    </section>
  );
}
