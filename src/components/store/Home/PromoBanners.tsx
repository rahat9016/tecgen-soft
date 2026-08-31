import Link from "next/link";
import { promoBanners } from "@/src/data/banners";
import { cn } from "@/src/lib/utils";
import {
  CreditCardIllustration,
  GiftBoxIllustration,
  ShoppingBagIllustration,
} from "./PromoIllustrations";

const illustrations = {
  card: CreditCardIllustration,
  gift: GiftBoxIllustration,
  bag: ShoppingBagIllustration,
} as const;

const toneStyles = {
  dark: {
    wrap: "bg-gradient-to-br from-emerald-900 via-emerald-950 to-black text-white border-emerald-800/50",
    button: "bg-amber-400 text-emerald-950 hover:bg-amber-300 shadow-[0_4px_0_0_rgba(180,120,0,0.6)] active:shadow-[0_1px_0_0_rgba(180,120,0,0.6)] active:translate-y-[3px]",
  },
  cream: {
    wrap: "bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100 text-emerald-950 border-amber-200/70",
    button: "bg-emerald-800 text-white hover:bg-emerald-900 shadow-[0_4px_0_0_rgba(6,78,59,0.5)] active:shadow-[0_1px_0_0_rgba(6,78,59,0.5)] active:translate-y-[3px]",
  },
  blue: {
    wrap: "bg-gradient-to-br from-sky-50 via-sky-50 to-sky-100 text-emerald-950 border-sky-200/70",
    button: "bg-sky-600 text-white hover:bg-sky-700 shadow-[0_4px_0_0_rgba(3,105,161,0.5)] active:shadow-[0_1px_0_0_rgba(3,105,161,0.5)] active:translate-y-[3px]",
  },
} as const;

export default function PromoBanners() {
  return (
    <section id="promos" className="container py-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {promoBanners.map((banner) => {
          const tone = toneStyles[banner.tone];
          const Illustration = illustrations[banner.icon];
          return (
            <div
              key={banner.title}
              className={cn(
                "group flex items-center justify-between gap-4 rounded-xl border p-6 shadow-lg transition-all duration-300 will-change-transform hover:-translate-y-1 hover:shadow-2xl",
                tone.wrap
              )}
            >
              <div>
                <p className="text-xs font-medium opacity-80">{banner.title}</p>
                <p className="text-xs opacity-70">{banner.subtitle}</p>
                <p className="mt-1 text-lg font-extrabold">{banner.highlight}</p>
                <p className="mt-1 text-xs opacity-70">{banner.note}</p>
                <Link
                  href="/ecommerce#products"
                  className={cn(
                    "mt-4 inline-block rounded-md px-4 py-2 text-xs font-semibold transition-all",
                    tone.button
                  )}
                >
                  {banner.cta}
                </Link>
              </div>
              <Illustration className="size-32 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
