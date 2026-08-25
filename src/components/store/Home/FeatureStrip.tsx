import { features } from "@/src/data/banners";

export default function FeatureStrip() {
  return (
    <section className="container my-8 md:my-10">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-xl border border-neutral-100 bg-white p-6 shadow-sm sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-neutral-100">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center gap-2 text-center lg:px-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <f.icon className="size-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-800">{f.title}</p>
              <p className="text-xs text-neutral-500">{f.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
