import { ExternalLink, MapPin } from "lucide-react";

export default function MapCard({ address }: { address: string }) {
  const query = encodeURIComponent(address);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white">
      <iframe
        title={`Map of ${address}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full border-0 sm:h-72"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="flex items-start gap-2 text-sm font-medium text-neutral-800">
          <MapPin className="mt-0.5 size-4 shrink-0 text-sky-600" />
          {address}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
        >
          Open in Google Maps <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
