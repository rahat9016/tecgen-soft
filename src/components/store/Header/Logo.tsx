import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-800 text-white">
        <ShoppingBag className="size-5" />
      </span>
      <span>
        <span className="block text-xl font-extrabold leading-tight text-emerald-950">
          FitStore<span className="text-amber-500">BD</span>
        </span>
        <span className="block text-[11px] text-neutral-500 leading-tight">
          Better Quality, Better Life
        </span>
      </span>
    </Link>
  );
}
