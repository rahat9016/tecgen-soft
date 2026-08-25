import Link from "next/link";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/ecommerce" className="flex flex-col shrink-0">
      <span className="flex items-center gap-1.5">
        <span className="text-xl md:text-2xl font-extrabold leading-none text-neutral-900">
          FitStore
        </span>
        <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
          BD
        </span>
      </span>
      {!compact && (
        <span className="mt-0.5 text-[11px] italic font-medium text-emerald-700 leading-none">
          Better Quality, Better Life
        </span>
      )}
    </Link>
  );
}
