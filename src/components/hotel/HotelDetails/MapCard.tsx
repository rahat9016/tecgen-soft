import { MapPin, ExternalLink } from "lucide-react";

export default function MapCard({ address }: { address: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
      <MapPin className="size-8 text-sky-600" />
      <p className="text-sm font-medium text-neutral-800">{address}</p>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline"
      >
        Open in Google Maps <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}
