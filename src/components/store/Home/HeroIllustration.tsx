export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 420 440"
      className="w-full h-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="42%" r="60%">
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

        <linearGradient id="bagBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
        <linearGradient id="bagPocket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="strap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#022c22" />
          <stop offset="100%" stopColor="#001a12" />
        </linearGradient>

        <linearGradient id="cupGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="bandGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>

        <linearGradient id="watchBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      <circle cx="210" cy="200" r="190" fill="url(#glow)" />

      {/* podium */}
      <ellipse cx="210" cy="360" rx="150" ry="26" fill="url(#podiumTop)" />
      <path
        d="M 60 360 L 60 384 A 150 26 0 0 0 360 384 L 360 360 A 150 26 0 0 1 60 360 Z"
        fill="url(#podiumSide)"
      />
      <ellipse cx="210" cy="360" rx="150" ry="26" fill="none" stroke="#a7f3d0" strokeOpacity="0.3" />

      {/* soft contact shadow */}
      <ellipse cx="215" cy="355" rx="95" ry="14" fill="#00150e" opacity="0.35" />

      {/* headphones (left, floating) */}
      <g transform="translate(-14 118) rotate(-10)">
        <path
          d="M8 78 C8 26 38 -2 76 -2 C114 -2 144 26 144 78"
          fill="none"
          stroke="url(#bandGrad)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <rect x="-8" y="70" width="30" height="52" rx="13" fill="url(#cupGrad)" />
        <rect x="-2" y="78" width="16" height="36" rx="8" fill="#022c22" opacity="0.55" />
        <rect x="122" y="70" width="30" height="52" rx="13" fill="url(#cupGrad)" />
        <rect x="130" y="78" width="16" height="36" rx="8" fill="#022c22" opacity="0.55" />
      </g>

      {/* backpack (center) */}
      <g transform="translate(126 96)">
        <ellipse cx="84" cy="248" rx="76" ry="14" fill="#00150e" opacity="0.25" />

        {/* top handle */}
        <path
          d="M56 14 C56 -6 112 -6 112 14"
          fill="none"
          stroke="url(#strap)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* main body */}
        <rect x="4" y="10" width="160" height="230" rx="34" fill="url(#bagBody)" />
        <rect x="4" y="10" width="160" height="230" rx="34" fill="none" stroke="#a7f3d0" strokeOpacity="0.25" />

        {/* side straps */}
        <rect x="-6" y="60" width="16" height="150" rx="8" fill="url(#strap)" />
        <rect x="158" y="60" width="16" height="150" rx="8" fill="url(#strap)" />

        {/* zip top seam */}
        <path
          d="M16 46 H152"
          stroke="#022c22"
          strokeOpacity="0.35"
          strokeWidth="3"
          strokeDasharray="2 6"
          strokeLinecap="round"
        />

        {/* front pocket */}
        <rect x="24" y="96" width="120" height="118" rx="26" fill="url(#bagPocket)" />
        <path
          d="M40 100 Q84 84 128 100"
          fill="none"
          stroke="#022c22"
          strokeOpacity="0.3"
          strokeWidth="3"
        />
        <rect x="66" y="140" width="36" height="36" rx="10" fill="#022c22" opacity="0.35" />
        <circle cx="84" cy="158" r="5" fill="#a7f3d0" />

        {/* logo patch */}
        <rect x="24" y="26" width="26" height="14" rx="4" fill="#a7f3d0" opacity="0.8" />
      </g>

      {/* smartwatch (right) */}
      <g transform="translate(300 176) rotate(6)">
        <rect x="16" y="-22" width="28" height="34" rx="8" fill="url(#strap)" />
        <rect x="16" y="80" width="28" height="34" rx="8" fill="url(#strap)" />
        <rect x="0" y="4" width="60" height="66" rx="18" fill="url(#watchBody)" />
        <rect x="8" y="12" width="44" height="50" rx="12" fill="#022c22" />
        <circle cx="30" cy="37" r="16" fill="none" stroke="#a7f3d0" strokeOpacity="0.6" strokeWidth="1.5" />
        <line x1="30" y1="37" x2="30" y2="27" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="37" x2="37" y2="40" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <rect x="58" y="26" width="6" height="10" rx="2" fill="url(#strap)" />
      </g>
    </svg>
  );
}
