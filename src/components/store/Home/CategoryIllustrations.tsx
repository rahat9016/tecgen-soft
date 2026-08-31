function Shadow({ id, color = "#000000", opacity = 0.28 }: { id: string; color?: string; opacity?: number }) {
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={color} floodOpacity={opacity} />
    </filter>
  );
}

export function MobileIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="mb-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <Shadow id="mb-shadow" />
      </defs>
      <g filter="url(#mb-shadow)">
        <rect x="36" y="16" width="48" height="88" rx="10" fill="url(#mb-body)" />
        <rect x="41" y="26" width="38" height="60" rx="3" fill="url(#mb-screen)" />
        <circle cx="60" cy="95" r="4" fill="#94a3b8" />
      </g>
    </svg>
  );
}

export function HeadphonesIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hp-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="hp-cup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <Shadow id="hp-shadow" />
      </defs>
      <g filter="url(#hp-shadow)">
        <path d="M28 60a32 32 0 0 1 64 0" stroke="url(#hp-band)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <rect x="20" y="56" width="18" height="30" rx="9" fill="url(#hp-cup)" />
        <rect x="82" y="56" width="18" height="30" rx="9" fill="url(#hp-cup)" />
      </g>
    </svg>
  );
}

export function FashionIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fs-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <Shadow id="fs-shadow" color="#6b21a8" opacity={0.3} />
      </defs>
      <g filter="url(#fs-shadow)">
        <path
          d="M45 20 L60 30 L75 20 L96 32 L86 50 L78 45 L78 100 L42 100 L42 45 L34 50 L24 32z"
          fill="url(#fs-shirt)"
        />
        <path d="M50 20 a10 10 0 0 0 20 0" stroke="#f3e8ff" strokeWidth="4" fill="none" />
      </g>
    </svg>
  );
}

export function KitchenIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kt-pot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <Shadow id="kt-shadow" color="#7f1d1d" opacity={0.3} />
      </defs>
      <g filter="url(#kt-shadow)">
        <path d="M46 30q6-10 14-10t14 10" stroke="#94a3b8" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="30" y="48" width="60" height="42" rx="6" fill="url(#kt-pot)" />
        <ellipse cx="60" cy="48" rx="30" ry="8" fill="#fca5a5" />
        <rect x="18" y="58" width="12" height="8" rx="4" fill="#94a3b8" />
        <rect x="90" y="58" width="12" height="8" rx="4" fill="#94a3b8" />
      </g>
    </svg>
  );
}

export function BeautyIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bt-tube" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <Shadow id="bt-shadow" color="#831843" opacity={0.3} />
      </defs>
      <g filter="url(#bt-shadow)">
        <rect x="48" y="50" width="24" height="46" rx="6" fill="#fce7f3" />
        <path d="M50 50l4-24h12l4 24z" fill="url(#bt-tube)" />
        <path
          d="M84 30l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"
          fill="#fbbf24"
        />
      </g>
    </svg>
  );
}

export function SportsIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sp-ball" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </radialGradient>
        <Shadow id="sp-shadow" opacity={0.25} />
      </defs>
      <g filter="url(#sp-shadow)">
        <circle cx="60" cy="60" r="36" fill="url(#sp-ball)" />
        <path
          d="M60 40l12 9-4 14H52l-4-14zM60 40V26M72 49l12-6M48 49l-12-6M56 63l-8 12M64 63l8 12"
          stroke="#1e293b"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function BooksIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <Shadow id="bk-shadow" opacity={0.25} />
      </defs>
      <g filter="url(#bk-shadow)">
        <rect x="24" y="70" width="72" height="14" rx="2" fill="#16a34a" transform="rotate(-3 60 77)" />
        <rect x="26" y="56" width="68" height="14" rx="2" fill="#f97316" />
        <rect x="28" y="42" width="64" height="14" rx="2" fill="#2563eb" transform="rotate(2 60 49)" />
        <rect x="46" y="20" width="28" height="22" rx="2" fill="#facc15" />
      </g>
    </svg>
  );
}

export function GroceryIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gr-basket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <Shadow id="gr-shadow" color="#78350f" opacity={0.3} />
      </defs>
      <g filter="url(#gr-shadow)">
        <path d="M34 52h52l-6 40a6 6 0 0 1-6 5H46a6 6 0 0 1-6-5z" fill="url(#gr-basket)" />
        <path d="M40 52l8-20M80 52l-8-20M50 52v-8M70 52v-8" stroke="#78350f" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M34 52h52" stroke="#451a03" strokeWidth="4" />
        <circle cx="52" cy="30" r="9" fill="#16a34a" />
        <circle cx="66" cy="26" r="7" fill="#ef4444" />
        <rect x="58" y="34" width="10" height="14" rx="3" fill="#fbbf24" />
      </g>
    </svg>
  );
}

export function CarIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cr-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <Shadow id="cr-shadow" color="#7f1d1d" opacity={0.3} />
      </defs>
      <g filter="url(#cr-shadow)">
        <path
          d="M22 72l6-18a10 10 0 0 1 9-7h46a10 10 0 0 1 9 7l6 18v10a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4v-2H36v2a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4z"
          fill="url(#cr-body)"
        />
        <path d="M36 47l-6 18h60l-6-18a4 4 0 0 0-4-3H40a4 4 0 0 0-4 3z" fill="#fecaca" opacity="0.7" />
        <circle cx="38" cy="82" r="8" fill="#1e293b" />
        <circle cx="82" cy="82" r="8" fill="#1e293b" />
        <circle cx="38" cy="82" r="3" fill="#cbd5e1" />
        <circle cx="82" cy="82" r="3" fill="#cbd5e1" />
      </g>
    </svg>
  );
}

export function ToysIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ty-pad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <Shadow id="ty-shadow" color="#4c1d95" opacity={0.3} />
      </defs>
      <g filter="url(#ty-shadow)">
        <path
          d="M32 46h56a16 16 0 0 1 16 18l-4 20a10 10 0 0 1-17 6l-8-8H45l-8 8a10 10 0 0 1-17-6l-4-20a16 16 0 0 1 16-18z"
          fill="url(#ty-pad)"
        />
        <rect x="42" y="58" width="6" height="16" rx="2" fill="#ede9fe" />
        <rect x="35" y="63" width="20" height="6" rx="2" fill="#ede9fe" />
        <circle cx="88" cy="58" r="5" fill="#fbbf24" />
        <circle cx="76" cy="70" r="5" fill="#34d399" />
      </g>
    </svg>
  );
}
