import { MapPinned } from "lucide-react";

export default function NearbySpots({
  nearby,
}: {
  nearby: { name: string; distance: string }[];
}) {
  return (
    <ul className="space-y-2">
      {nearby.map((spot) => (
        <li
          key={spot.name}
          className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 text-sm"
        >
          <span className="flex items-center gap-2 text-neutral-700">
            <MapPinned className="size-4 text-sky-600" />
            {spot.name}
          </span>
          <span className="text-xs text-neutral-500">{spot.distance}</span>
        </li>
      ))}
    </ul>
  );
}
