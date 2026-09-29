import { BadgePercent, CreditCard, Headset, RefreshCcw, Truck } from "lucide-react";

const services = [
  { icon: CreditCard, title: "0% EMI up to 12 Months" },
  { icon: Truck, title: "Fastest Home Delivery" },
  { icon: RefreshCcw, title: "Exchange Facility" },
  { icon: BadgePercent, title: "Best Price Deals" },
  { icon: Headset, title: "After Sales Service" },
];

export default function ServiceStrip() {
  return (
    <section className="container mt-5">
      <ul className="grid grid-cols-2 gap-3 rounded-2xl border border-neutral-100 p-3 sm:grid-cols-3 lg:grid-cols-5">
        {services.map(({ icon: Icon, title }) => (
          <li key={title} className="flex items-center gap-3 rounded-xl px-3 py-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <Icon className="size-[18px]" />
            </span>
            <span className="text-xs font-medium text-neutral-700 sm:text-sm">{title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
