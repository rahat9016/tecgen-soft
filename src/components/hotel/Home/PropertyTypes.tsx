import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { propertyTypes } from "@/src/data/hotelHome";
import SectionHeading from "./SectionHeading";

export default function PropertyTypes() {
  return (
    <section className="container pb-4 pt-12">
      <SectionHeading
        title="Browse by property type"
        subtitle="From budget hotels to private villas — find the stay that suits you."
        href="/hotel-management/search"
      />

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {propertyTypes.map(({ label, description, icon: Icon, bg, hover }) => (
          <Link
            key={label}
            href={`/hotel-management/search?type=${encodeURIComponent(label)}`}
            className="group flex flex-col gap-3 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg sm:flex-row sm:items-center sm:gap-4"
          >
            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition duration-300 md:size-14 ${bg} ${hover}`}
            >
              <Icon className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-neutral-900">{label}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                {description}
              </p>
            </div>
            <ArrowRight className="hidden size-4 shrink-0 -translate-x-1 text-neutral-300 transition group-hover:translate-x-0 group-hover:text-neutral-700 sm:block" />
          </Link>
        ))}
      </div>
    </section>
  );
}
