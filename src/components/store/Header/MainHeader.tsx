"use client";

import Link from "next/link";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { Input } from "@/src/components/ui/input";
import { useAppSelector } from "@/src/lib/redux/hooks";

export default function MainHeader() {
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, i) => sum + i.qty, 0)
  );

  return (
    <div className="bg-white">
      <div className="container grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3 md:gap-6 md:py-4">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Logo compact />
        </div>

        <form className="hidden md:flex justify-center">
          <div className="flex w-full max-w-2xl">
            <Input
              type="search"
              placeholder="আপনার পছন্দের পণ্য খুঁজুন..."
              className="h-11 rounded-r-none border-r-0 focus-visible:ring-0"
            />
            <button
              type="submit"
              className="flex items-center justify-center rounded-md rounded-l-none bg-emerald-600 px-5 text-white hover:bg-emerald-700"
              aria-label="Search"
            >
              <Search className="size-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 md:gap-5">
          <Link
            href="#"
            className="hidden md:flex flex-col items-center gap-0.5 text-neutral-700 hover:text-emerald-700"
          >
            <Heart className="size-5" />
            <span className="text-xs">Wishlist</span>
          </Link>

          <span className="hidden md:block h-8 w-px bg-neutral-200" />

          <Link
            href="/ecommerce/cart"
            className="relative flex flex-col items-center gap-0.5 text-neutral-700 hover:text-emerald-700"
          >
            <span className="relative">
              <ShoppingCart className="size-5" />
              <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            </span>
            <span className="hidden md:block text-xs">Cart</span>
          </Link>

          <span className="hidden md:block h-8 w-px bg-neutral-200" />

          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 text-neutral-700 hover:text-emerald-700"
          >
            <User className="size-5" />
            <span className="hidden lg:inline text-sm">Login / Sign Up</span>
          </Link>
        </div>
      </div>

      <form className="container flex md:hidden pb-3">
        <div className="flex w-full">
          <Input
            type="search"
            placeholder="আপনার পছন্দের পণ্য খুঁজুন..."
            className="h-10 rounded-r-none border-r-0 focus-visible:ring-0"
          />
          <button
            type="submit"
            className="flex items-center justify-center rounded-md rounded-l-none bg-emerald-600 px-4 text-white hover:bg-emerald-700"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
