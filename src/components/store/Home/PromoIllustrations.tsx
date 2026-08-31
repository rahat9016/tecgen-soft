export function CreditCardIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cc-back" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="cc-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <filter id="cc-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.28" />
        </filter>
      </defs>
      <g filter="url(#cc-shadow)">
        <rect x="14" y="18" width="86" height="54" rx="8" fill="url(#cc-back)" transform="rotate(-8 57 45)" />
        <rect x="18" y="42" width="90" height="56" rx="8" fill="url(#cc-front)" />
        <rect x="26" y="54" width="20" height="14" rx="3" fill="#f59e0b" />
        <rect x="26" y="80" width="42" height="5" rx="2.5" fill="#e2e8f0" opacity="0.85" />
        <rect x="26" y="89" width="26" height="4" rx="2" fill="#94a3b8" />
        <circle cx="92" cy="60" r="9" fill="#ef4444" opacity="0.85" />
        <circle cx="100" cy="60" r="9" fill="#f59e0b" opacity="0.85" />
      </g>
    </svg>
  );
}

export function GiftBoxIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gb-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="gb-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="gb-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#92400e" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter="url(#gb-shadow)">
        <rect x="20" y="52" width="80" height="46" rx="4" fill="url(#gb-box)" />
        <rect x="16" y="38" width="88" height="18" rx="4" fill="url(#gb-lid)" />
        <rect x="52" y="38" width="16" height="60" fill="#ea580c" />
        <path
          d="M60 38c-10-4-16-14-10-22 5-6 15-2 10 10-5-12-15-16-20-8-4 7 6 16 20 20z"
          fill="#f97316"
        />
        <path
          d="M60 38c10-4 16-14 10-22-5-6-15-2-10 10 5-12 15-16 20-8 4 7-6 16-20 20z"
          fill="#fb923c"
        />
      </g>
    </svg>
  );
}

export function ShoppingBagIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="sb-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#075985" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter="url(#sb-shadow)">
        <path
          d="M32 44h56l6 52a6 6 0 0 1-6 6.5H32a6 6 0 0 1-6-6.5z"
          fill="url(#sb-body)"
        />
        <rect x="26" y="44" width="68" height="10" fill="#0369a1" />
        <path
          d="M42 44v-8a18 18 0 0 1 36 0v8"
          stroke="#0369a1"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
