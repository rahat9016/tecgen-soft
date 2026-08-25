import { stats } from "@/src/data/banners";

export default function StatsBar() {
  return (
    <section className="bg-emerald-950 text-white">
      <div className="container grid grid-cols-2 gap-6 py-8 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center gap-2">
            <s.icon className="size-6 text-amber-400" />
            <span className="text-lg font-bold">{s.value}</span>
            <span className="text-xs text-emerald-200">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
