"use client";

import Link from "next/link";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import Logo from "./Logo";
import { Input } from "@/src/components/ui/input";
import { useAppSelector } from "@/src/lib/redux/hooks";

export default function MainHeader() {
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, i) => sum + i.qty, 0)
  );

  return (
    <div className="bg-white">
      <div className="container flex items-center gap-6 py-4">
        <Logo />

        <form className="hidden md:flex flex-1 max-w-2xl">
          <div className="flex w-full">
            <Input
              type="search"
              placeholder="আপনার পছন্দের পণ্য খুঁজুন..."
              className="h-11 rounded-r-none border-r-0 focus-visible:ring-0"
            />
            <button
              type="submit"
              className="flex items-center justify-center rounded-md rounded-l-none bg-emerald-800 px-5 text-white hover:bg-emerald-900"
              aria-label="Search"
            >
              <Search className="size-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-6 ml-auto">
          <Link
            href="#"
            className="hidden sm:flex flex-col items-center text-neutral-700 hover:text-emerald-800"
          >
            <Heart className="size-5" />
            <span className="text-xs">Wishlist</span>
          </Link>

          <Link
            href="/cart"
            className="relative flex flex-col items-center text-neutral-700 hover:text-emerald-800"
          >
            <ShoppingCart className="size-5" />
            <span className="text-xs">Cart</span>
            <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 text-neutral-700 hover:text-emerald-800"
          >
            <User className="size-5" />
            <span className="hidden sm:inline text-sm">Login / Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
