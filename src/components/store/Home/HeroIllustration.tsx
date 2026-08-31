function Backdrop() {
  return (
    <svg
      viewBox="0 0 460 440"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="podiumTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="podiumSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
      </defs>

      <circle cx="230" cy="190" r="200" fill="url(#glow)" />

      <ellipse cx="230" cy="358" rx="170" ry="28" fill="url(#podiumTop)" />
      <path
        d="M 60 358 L 60 384 A 170 28 0 0 0 400 384 L 400 358 A 170 28 0 0 1 60 358 Z"
        fill="url(#podiumSide)"
      />
      <ellipse cx="230" cy="358" rx="170" ry="28" fill="none" stroke="#a7f3d0" strokeOpacity="0.3" />
    </svg>
  );
}

const HEADPHONES_IMG =
  "https://images.unsplash.com/photo-1641563786213-185d68345426?q=80&w=400&h=400&auto=format&fit=crop";
const BACKPACK_IMG =
  "https://images.pexels.com/photos/3731256/pexels-photo-3731256.jpeg?w=600&h=600&fit=crop&crop=bottom";
const WATCH_IMG =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&h=400&auto=format&fit=crop&crop=left";

export default function HeroIllustration() {
  return (
    <div className="relative h-full w-full">
      <Backdrop />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HEADPHONES_IMG}
        alt="Headphones"
        className="absolute left-[2%] top-[16%] size-[34%] rounded-full object-cover shadow-[0_16px_28px_rgba(0,0,0,0.4)] ring-2 ring-white/10"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BACKPACK_IMG}
        alt="Backpack"
        className="absolute bottom-[16%] left-1/2 size-[58%] -translate-x-1/2 rounded-[40%] object-cover shadow-[0_20px_36px_rgba(0,0,0,0.45)] ring-2 ring-white/10"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={WATCH_IMG}
        alt="Smartwatch"
        className="absolute right-[3%] top-[34%] size-[30%] rounded-full object-cover shadow-[0_16px_28px_rgba(0,0,0,0.4)] ring-2 ring-white/10"
      />
    </div>
  );
}
