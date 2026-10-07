import {
  Car,
  Footprints,
  Landmark,
  MapPin,
  Navigation,
  Phone,
  Plane,
  Star,
  Trees,
  Waves,
} from "lucide-react";
import type { Hotel, NearbyPlace } from "@/src/data/hotels";

const placeStyle: Record<
  NearbyPlace["type"],
  { icon: typeof Waves; tone: string }
> = {
  beach: { icon: Waves, tone: "bg-sky-50 text-sky-600" },
  temple: { icon: Landmark, tone: "bg-amber-50 text-amber-600" },
  airport: { icon: Plane, tone: "bg-violet-50 text-violet-600" },
  park: { icon: Trees, tone: "bg-emerald-50 text-emerald-600" },
};

// Rough guide only: walking at ~5 km/h for short hops, driving at ~25 km/h in town traffic.
const travelTime = (distance: string) => {
  const km = parseFloat(distance);
  if (Number.isNaN(km)) return null;
  return km <= 1.5
    ? {
        icon: Footprints,
        text: `${Math.max(1, Math.round((km / 5) * 60))} min walk`,
      }
    : { icon: Car, text: `${Math.round((km / 25) * 60)} min drive` };
};

/** Map with the hotel's address and quick actions, plus nearby places with distances. */
export default function LocationCard({ hotel }: { hotel: Hotel }) {
  // Address only: the sample hotel name would match unrelated real businesses on Google Maps.
  const query = encodeURIComponent(hotel.address);

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm">
      <div className="relative">
        <div className="relative h-72 bg-sky-50 sm:h-96">
          <iframe
            title={`Map of ${hotel.name}`}
            src={`https://www.google.com/maps?q=${query}&z=15&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 size-full border-0 [filter:saturate(0.9)]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-32 bg-gradient-to-t from-neutral-950/30 to-transparent sm:block" />
        </div>

        {/* Phones: card sits under the map, overlapping its edge. sm+: floats over the map. */}
        <div className="relative mx-3 -mt-10 rounded-2xl border border-white/60 bg-white/85 p-4 shadow-xl shadow-neutral-900/15 backdrop-blur-xl sm:absolute sm:bottom-5 sm:left-5 sm:mx-0 sm:mt-0 sm:w-96">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/30">
              <MapPin className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-neutral-900">{hotel.name}</p>
              <p className="mt-0.5 text-sm text-neutral-600">{hotel.address}</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-neutral-700">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {hotel.rating.toFixed(1)}
                <span className="font-normal text-neutral-500">
                  · {hotel.reviewsCount} reviews
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-600/25 transition hover:bg-sky-700"
            >
              <Navigation className="size-4" /> Get directions
            </a>
            <a
              href={`tel:${hotel.phone}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-sky-200 hover:text-sky-700"
            >
              <Phone className="size-4" /> Call hotel
            </a>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-bold text-neutral-900">What&rsquo;s nearby</p>
          <p className="text-xs text-neutral-500">Approx. travel times</p>
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {hotel.nearby.map((place) => {
            const { icon: Icon, tone } = placeStyle[place.type];
            const time = travelTime(place.distance);
            return (
              <li
                key={place.name}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200/70 p-3 transition hover:border-sky-200 hover:bg-sky-50/40"
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {place.name}
                  </p>
                  {time && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                      <time.icon className="size-3.5" /> {time.text}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-700">
                  {place.distance}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
