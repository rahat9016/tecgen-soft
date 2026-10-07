import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "View all",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 md:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-200 hover:bg-sky-50"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
