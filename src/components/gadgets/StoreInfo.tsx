const blocks = [
  {
    title: "Bangladesh's Trusted Gadget Store",
    body: "gadgethub brings original smartphones, laptops, wearables and audio gear to your door. Every product comes with official or store warranty, and our team checks each unit before it ships so you get exactly what you ordered.",
    tone: "bg-orange-50",
  },
  {
    title: "Power Solutions & Portable Energy",
    body: "Stay charged wherever you go. From slim 10000mAh power banks to multi-port GaN chargers and braided fast-charging cables, we stock reliable power gear from Anker, Xiaomi, Samsung and more.",
    tone: "bg-sky-50",
  },
  {
    title: "Audio That Moves With You",
    body: "Noise-cancelling headphones for the commute, true-wireless earbuds for the gym and portable speakers for weekend trips — shop Apple, Sony, JBL, Marshall and Samsung audio at the best price in Bangladesh.",
    tone: "bg-violet-50",
  },
  {
    title: "Smartphones, Tablets & the Complete Ecosystem",
    body: "Pick the latest iPhone, Galaxy or Pixel and pair it with a matching watch, tablet and earbuds. Mix and match accessories, pay in 0% EMI and upgrade anytime with our exchange programme.",
    tone: "bg-emerald-50",
  },
  {
    title: "Gaming, Cameras & Creator Gear",
    body: "Consoles, controllers, VR headsets, action cameras and drones — everything a gamer or content creator needs, with genuine accessories and after-sales support from our service centre.",
    tone: "bg-rose-50",
  },
];

export default function StoreInfo() {
  return (
    <section className="container mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {blocks.slice(0, 1).map((b) => (
        <InfoCard key={b.title} {...b} />
      ))}
      <div className="relative min-h-60 overflow-hidden rounded-2xl bg-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gadgets/meta-quest-3.webp"
          alt="Meta Quest 3 VR headset"
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">New in VR</p>
          <p className="mt-1 text-2xl font-extrabold">Step into the future with VR</p>
        </div>
      </div>
      {blocks.slice(1).map((b) => (
        <InfoCard key={b.title} {...b} />
      ))}
    </section>
  );
}

function InfoCard({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <article className={`rounded-2xl p-6 ${tone}`}>
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{body}</p>
    </article>
  );
}
