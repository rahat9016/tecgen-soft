import { features } from "@/src/data/banners";

export default function FeatureStrip() {
  return (
    <section className="border-b border-neutral-100 bg-emerald-50/40">
      <div className="container grid grid-cols-2 gap-6 py-6 sm:grid-cols-3 lg:grid-cols-5">
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm">
              <f.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-800">{f.title}</p>
              <p className="truncate text-xs text-neutral-500">{f.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
