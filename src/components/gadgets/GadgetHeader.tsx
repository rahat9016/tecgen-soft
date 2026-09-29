"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarClock,
  Flame,
  Heart,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Package,
  ShoppingBag,
  Truck,
  User,
  UserRound,
  X,
} from "lucide-react";
import GadgetLogo from "./GadgetLogo";
import GadgetSearch from "./GadgetSearch";
import { cartDetails, currentUser, useGadgetDB, useHydrated } from "@/src/lib/gadget-store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

export const gadgetNav = [
  { label: "Apple Products", href: "/gadgets/shop?brand=Apple" },
  { label: "Phones", href: "/gadgets/shop?category=Phones" },
  { label: "Tablets", href: "/gadgets/shop?category=Tablets" },
  { label: "Laptops", href: "/gadgets/shop?category=Laptops" },
  { label: "Smart Watch", href: "/gadgets/shop?category=Smart+Watch" },
  { label: "Earbuds & Headphones", href: "/gadgets/shop?category=Earbuds,Headphones" },
  { label: "Speakers", href: "/gadgets/shop?category=Speakers" },
  { label: "Power & Charging", href: "/gadgets/shop?category=Power" },
  { label: "Gaming", href: "/gadgets/shop?category=Gaming,VR" },
  { label: "Cameras & Drones", href: "/gadgets/shop?category=Cameras,Drones" },
  { label: "Smart Home", href: "/gadgets/shop?category=Smart+Home,E-Readers" },
];

export const accountLinks = [
  { label: "My Profile", href: "/gadgets/account", icon: UserRound },
  { label: "My Orders", href: "/gadgets/account/orders", icon: Package },
  { label: "Pre-orders", href: "/gadgets/account/pre-orders", icon: CalendarClock },
  { label: "Wishlist", href: "/gadgets/account/wishlist", icon: Heart },
  { label: "Messages", href: "/gadgets/account/messages", icon: MessageCircle },
  { label: "Track Order", href: "/gadgets/track-order", icon: Truck },
];

export default function GadgetHeader() {
  const db = useGadgetDB();
  const hydrated = useHydrated();
  const { count } = cartDetails(db);
  const user = currentUser(db);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
      <div className="container flex items-center gap-4 py-3 md:gap-8">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-neutral-700 lg:hidden">
          <Menu className="size-6" />
        </button>

        <GadgetLogo />

        <div className="hidden flex-1 md:block">
          <GadgetSearch className="max-w-xl" />
        </div>

        <nav className="ml-auto flex items-center gap-2 md:gap-5">
          <Link
            href="/gadgets/track-order"
            className="hidden items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-orange-500 xl:flex"
          >
            <Truck className="size-4" /> Track Order
          </Link>
          <Link
            href="/gadgets/pre-order"
            className="hidden items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-orange-500 lg:flex"
          >
            <CalendarClock className="size-4" /> Pre-order
          </Link>
          <Link
            href="/gadgets/shop?sort=discount"
            className="hidden items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 sm:flex"
          >
            <Flame className="size-4" /> Offers
          </Link>
          <Link
            href="/gadgets/cart"
            aria-label={`Cart, ${count} items`}
            className="relative flex size-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-800 hover:border-orange-500 hover:text-orange-500"
          >
            <ShoppingBag className="size-4.5" />
            {hydrated && count > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Account menu"
                className="flex size-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-800 hover:border-orange-500 hover:text-orange-500"
              >
                {hydrated ? (
                  <span className="text-sm font-semibold">{user.name[0]}</span>
                ) : (
                  <User className="size-4.5" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={10} className="w-56">
              <DropdownMenuLabel>
                <p className="truncate text-sm font-semibold">{hydrated ? user.name : "My Account"}</p>
                <p className="truncate text-xs font-normal text-neutral-500">{hydrated ? user.email : ""}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {accountLinks.map(({ label, href, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href} className="cursor-pointer">
                    <Icon className="size-4" /> {label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/gadgets/admin" className="cursor-pointer">
                  <LayoutDashboard className="size-4" /> Admin Panel
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>

      <div className="container pb-3 md:hidden">
        <GadgetSearch placeholder="Search gadgets..." />
      </div>

      <div className="hidden border-t border-neutral-100 lg:block">
        <ul className="container flex items-center justify-between gap-4 overflow-x-auto py-2.5 text-[13px] text-neutral-700 [scrollbar-width:none]">
          {gadgetNav.map((item) => (
            <li key={item.label} className="shrink-0">
              <Link href={item.href} className="hover:text-orange-500">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white p-5">
            <div className="flex items-center justify-between">
              <GadgetLogo />
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Shop</p>
            <ul className="mt-2 space-y-1">
              {[{ label: "Pre-order", href: "/gadgets/pre-order" }, ...gadgetNav].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Account</p>
            <ul className="mt-2 space-y-1">
              {accountLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
