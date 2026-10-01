// 3D icons from Microsoft Fluent Emoji (MIT), stored in /public/gadgets/services.
const services = [
  { icon: "/gadgets/services/emi.webp", title: "0% EMI up to 12 Months" },
  { icon: "/gadgets/services/delivery.webp", title: "Fastest Home Delivery" },
  { icon: "/gadgets/services/exchange.webp", title: "Exchange Facility" },
  { icon: "/gadgets/services/best-price.webp", title: "Best Price Deals" },
  { icon: "/gadgets/services/after-sales.webp", title: "After Sales Service" },
];

export default function ServiceStrip() {
  return (
    <section className="container mt-5">
      <ul className="grid grid-cols-2 gap-3 rounded-2xl border border-neutral-100 p-3 sm:grid-cols-3 lg:grid-cols-5">
        {services.map(({ icon, title }) => (
          <li key={title} className="group flex items-center gap-3 rounded-xl px-3 py-2">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100/60 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={icon}
                alt=""
                width={128}
                height={128}
                className="size-9 drop-shadow-md transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
              />
            </span>
            <span className="text-xs font-medium text-neutral-700 sm:text-sm">{title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
