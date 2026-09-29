import Link from "next/link";

// Horizontal lockups are cropped from /gadgets/logo.png; the light one swaps the navy text to white for dark backgrounds.
export default function GadgetLogo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/gadgets" className="shrink-0" aria-label="gadgethub home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={light ? "/gadgets/logo-horizontal-light.webp" : "/gadgets/logo-horizontal.webp"}
        alt="gadgethub — Smart Tech Store"
        width={716}
        height={132}
        className="h-9 w-auto md:h-11"
      />
    </Link>
  );
}
