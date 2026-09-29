import Link from "next/link";
import { ArrowRight, RefreshCcw } from "lucide-react";

const phones = ["/gadgets/iphone-15.webp", "/gadgets/galaxy-s24-ultra.webp", "/gadgets/pixel-8.webp"];

export default function ExchangeBanner() {
  return (
    <section className="container mt-14">
      <div className="relative grid overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 md:grid-cols-2">
        <div className="relative z-10 p-6 sm:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
            <RefreshCcw className="size-3.5" /> Exchange Offer
          </span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-neutral-900 sm:text-5xl">
            Old phone out,
            <br />
            new phone in!
          </h2>
          <p className="mt-3 max-w-sm text-sm text-neutral-800 sm:text-base">
            Bring your old smartphone to any outlet — get an instant price valuation and pay only the
            difference.
          </p>
          <Link
            href="#featured"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Exchange Now <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="relative flex items-end justify-center gap-3 px-6 pb-6 md:pb-0 md:pt-10">
          {phones.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className={`w-1/3 max-w-[170px] rounded-2xl object-cover shadow-2xl ring-4 ring-white/40 ${
                i === 1 ? "aspect-[3/4] md:mb-10" : "aspect-[3/4] md:mb-4"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
