import Link from "next/link";
import { propertyTypes } from "@/src/data/hotelHome";

export default function PropertyTypes() {
  return (
    <section className="container pb-4 pt-12">
      <h2 className="text-xl font-bold text-neutral-900 md:text-2xl">Browse by property type</h2>
      <p className="mt-1 text-sm text-neutral-500">
        From budget hotels to private villas — find the stay that suits you.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {propertyTypes.map(({ label, icon: Icon, bg }) => (
          <Link
            key={label}
            href={
              label === "All Properties"
                ? "/hotel-management/search"
                : `/hotel-management/search?type=${encodeURIComponent(label)}`
            }
            className="group flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-2 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-sky-100 hover:shadow-lg"
          >
            <span
              className={`flex size-14 items-center justify-center rounded-2xl transition group-hover:scale-110 ${bg}`}
            >
              <Icon className="size-6" />
            </span>
            <span className="text-xs font-semibold text-neutral-700 group-hover:text-sky-700 md:text-sm">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
