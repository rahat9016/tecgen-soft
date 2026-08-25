import Link from "next/link";
import { Facebook, Instagram, ChevronDown } from "lucide-react";

export default function TopBar() {
  return (
    <div className="bg-emerald-950 text-emerald-50 text-xs">
      <div className="container flex items-center justify-between gap-4 py-2">
        <p className="truncate">
          বিশেষ অফার! প্রথম অর্ডারে ২০% ছাড় । কুপন কোড:{" "}
          <span className="font-semibold text-amber-400">WELCOME20</span>
        </p>
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Link href="/order-success" className="hover:text-amber-400">
            Track Order
          </Link>
          <Link href="#" className="hover:text-amber-400">
            Help Center
          </Link>
          <Link href="#" className="hover:text-amber-400">
            Returns
          </Link>
          <button className="flex items-center gap-1 hover:text-amber-400">
            বাংলা <ChevronDown className="size-3" />
          </button>
          <div className="flex items-center gap-2">
            <Link
              href="#"
              className="flex size-6 items-center justify-center rounded-full bg-white/10 hover:bg-amber-400 hover:text-emerald-950"
            >
              <Facebook className="size-3.5" />
            </Link>
            <Link
              href="#"
              className="flex size-6 items-center justify-center rounded-full bg-white/10 hover:bg-amber-400 hover:text-emerald-950"
            >
              <Instagram className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
