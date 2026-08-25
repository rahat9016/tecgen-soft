import { propertyTypes } from "@/src/data/hotelHome";

export default function PropertyTypes() {
  return (
    <section className="container py-8">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-9">
        {propertyTypes.map(({ label, icon: Icon, bg }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-2 text-center"
          >
            <span className={`flex size-14 items-center justify-center rounded-full ${bg}`}>
              <Icon className="size-6" />
            </span>
            <span className="text-xs font-medium text-neutral-700">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
