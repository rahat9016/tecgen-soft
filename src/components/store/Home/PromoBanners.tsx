import Link from "next/link";
import { CreditCard, Gift, ShoppingBag } from "lucide-react";
import { promoBanners } from "@/src/data/banners";
import { cn } from "@/src/lib/utils";

const toneStyles = {
  dark: {
    wrap: "bg-emerald-950 text-white",
    button: "bg-amber-400 text-emerald-950 hover:bg-amber-300",
    icon: "bg-white/10 text-white",
  },
  cream: {
    wrap: "bg-amber-50 text-emerald-950",
    button: "bg-emerald-800 text-white hover:bg-emerald-900",
    icon: "bg-amber-200 text-amber-700",
  },
  blue: {
    wrap: "bg-sky-50 text-emerald-950",
    button: "bg-sky-600 text-white hover:bg-sky-700",
    icon: "bg-sky-200 text-sky-700",
  },
} as const;

const icons = [CreditCard, Gift, ShoppingBag];

export default function PromoBanners() {
  return (
    <section id="promos" className="container py-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {promoBanners.map((banner, i) => {
          const tone = toneStyles[banner.tone];
          const Icon = icons[i];
          return (
            <div
              key={banner.title}
              className={cn("flex items-center justify-between gap-4 rounded-xl p-6", tone.wrap)}
            >
              <div>
                <p className="text-xs font-medium opacity-80">{banner.title}</p>
                <p className="text-xs opacity-70">{banner.subtitle}</p>
                <p className="mt-1 text-lg font-extrabold">{banner.highlight}</p>
                <p className="mt-1 text-xs opacity-70">{banner.note}</p>
                <Link
                  href="/#products"
                  className={cn(
                    "mt-4 inline-block rounded-md px-4 py-2 text-xs font-semibold",
                    tone.button
                  )}
                >
                  {banner.cta}
                </Link>
              </div>
              <span className={cn("flex size-16 shrink-0 items-center justify-center rounded-full", tone.icon)}>
                <Icon className="size-7" />
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
