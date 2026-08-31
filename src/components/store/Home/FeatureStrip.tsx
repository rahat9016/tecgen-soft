import { features } from "@/src/data/banners";
import {
  PaymentBadge,
  DeliveryBadge,
  FreeReturnBadge,
  PriceBadge,
  AuthenticBadge,
  SecureBadge,
} from "./FeatureBadges";

const badges = {
  payment: PaymentBadge,
  delivery: DeliveryBadge,
  return: FreeReturnBadge,
  price: PriceBadge,
  authentic: AuthenticBadge,
  secure: SecureBadge,
} as const;

export default function FeatureStrip() {
  return (
    <section className="container my-6 md:my-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-4 rounded-xl border border-neutral-100 bg-white px-6 py-4 shadow-sm md:flex-nowrap md:justify-between">
        {features.map((f, i) => {
          const Badge = badges[f.icon];
          return (
            <div key={f.title} className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <Badge className="size-9 shrink-0" />
                <span className="whitespace-nowrap text-sm font-semibold text-neutral-800">
                  {f.title}
                </span>
              </div>
              {i < features.length - 1 && (
                <span className="hidden h-8 w-px shrink-0 bg-neutral-200 md:block" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
