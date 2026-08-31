export function PaymentBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pb-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path
        d="M24 4l16 6v10c0 11-7 18-16 24C15 38 8 31 8 20V10z"
        fill="url(#pb-shield)"
      />
      <path
        d="M16 24l6 6 11-13"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function DeliveryBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="db-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect x="4" y="18" width="24" height="14" rx="2" fill="url(#db-body)" />
      <path d="M28 22h8l6 6v4h-14z" fill="url(#db-body)" />
      <rect x="6" y="21" width="9" height="6" rx="1" fill="#fff7ed" opacity="0.85" />
      <circle cx="15" cy="34" r="4.5" fill="#1e293b" />
      <circle cx="15" cy="34" r="1.8" fill="#cbd5e1" />
      <circle cx="35" cy="34" r="4.5" fill="#1e293b" />
      <circle cx="35" cy="34" r="1.8" fill="#cbd5e1" />
      <path d="M2 20h4M1 24h5M3 28h3" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function FreeReturnBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fr-badge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="19" fill="url(#fr-badge)" />
      <circle cx="24" cy="24" r="19" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="2 3" />
      <path
        d="M17 20a8 8 0 0 1 14-5"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M30 11l1 5-5-1z" fill="#ffffff" />
      <text x="24" y="31" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff">
        FREE
      </text>
    </svg>
  );
}

export function SecureBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sc-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M24 4l16 6v10c0 11-7 18-16 24C15 38 8 31 8 20V10z" fill="url(#sc-shield)" />
      <rect x="17" y="21" width="14" height="11" rx="2.5" fill="#ffffff" />
      <path d="M19 21v-4a5 5 0 0 1 10 0v4" stroke="#ffffff" strokeWidth="3" fill="none" />
      <circle cx="24" cy="26" r="2" fill="#1d4ed8" />
    </svg>
  );
}

export function PriceBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pr-badge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d="M14 26l-4 14 7-3 3 7 5-16z" fill="url(#pr-badge)" />
      <path d="M34 26l4 14-7-3-3 7-5-16z" fill="url(#pr-badge)" />
      <circle cx="24" cy="18" r="14" fill="url(#pr-badge)" />
      <text x="24" y="23" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
        ৳
      </text>
    </svg>
  );
}

export function AuthenticBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="au-badge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <path
        d="M24 4l4.5 3.2 5.5-.6 1.8 5.2 5.2 1.8-.6 5.5L44 24l-3.6 4.9.6 5.5-5.2 1.8-1.8 5.2-5.5-.6L24 44l-4.5-3.2-5.5.6-1.8-5.2-5.2-1.8.6-5.5L4 24l3.6-4.9-.6-5.5 5.2-1.8 1.8-5.2 5.5.6z"
        fill="url(#au-badge)"
      />
      <path
        d="M17 24l5 5 10-11"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
