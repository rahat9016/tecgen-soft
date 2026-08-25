import { ArrowRight, MapPinned, Car, Bus, Plane } from "lucide-react";
import { moreThanStays } from "@/src/data/hotelHome";

const icons = {
  TourPackages: MapPinned,
  CarRental: Car,
  BusTickets: Bus,
  FlightTickets: Plane,
} as const;

export default function MoreThanStays() {
  return (
    <section className="container py-8">
      <h2 className="text-xl font-bold text-neutral-900">More Than Just Stays</h2>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {moreThanStays.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons];
          return (
            <a
              key={item.title}
              href="#"
              className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${item.bg}`}>
                <Icon className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                <p className="text-xs text-neutral-500">{item.subtitle}</p>
              </div>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
                <ArrowRight className="size-4" />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
