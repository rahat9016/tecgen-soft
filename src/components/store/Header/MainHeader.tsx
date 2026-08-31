"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Heart, Search, ShoppingCart } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { Input } from "@/src/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { logoutUser } from "@/src/lib/redux/features/auth/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

export default function MainHeader() {
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, i) => sum + i.qty, 0)
  );
  const userInformation = useAppSelector((state) => state.auth.userInformation);
  const firstName = userInformation.firstName || "Sadia";
  const lastName = userInformation.lastName || "Rahman";
  const email = userInformation.email || "sadia.rahman@example.com";
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

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
              placeholder="Search for your favorite products..."
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 text-neutral-700 hover:text-emerald-700"
                aria-label="Open account menu"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
                  {firstName[0].toUpperCase()}
                </span>
                <span className="hidden lg:flex lg:items-center lg:gap-1 text-sm">
                  {firstName}
                  <ChevronDown className="size-3.5" />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={10} className="w-48">
              <DropdownMenuLabel className="truncate">
                {`${firstName} ${lastName}`.trim() || email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/ecommerce/order-success")}>
                My Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("#")}>
                Wishlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("#")}>
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <form className="container flex md:hidden pb-3">
        <div className="flex w-full">
          <Input
            type="search"
            placeholder="Search for your favorite products..."
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
