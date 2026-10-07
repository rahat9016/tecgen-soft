import { MapPinned } from "lucide-react";

export default function NearbySpots({
  nearby,
}: {
  nearby: { name: string; distance: string }[];
}) {
  return (
    <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200/70 bg-white">
      {nearby.map((spot) => (
        <li key={spot.name} className="flex items-center gap-3 px-4 py-3 text-sm">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <MapPinned className="size-4" />
          </span>
          <span className="min-w-0 flex-1 font-medium text-neutral-800">{spot.name}</span>
          <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">
            {spot.distance}
          </span>
        </li>
      ))}
    </ul>
  );
}
