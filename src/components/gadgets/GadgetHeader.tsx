"use client";

import Link from "next/link";
import { useState } from "react";
import { Flame, Menu, Search, ShoppingBag, Timer, User, X, GitCompare } from "lucide-react";
import GadgetLogo from "./GadgetLogo";
import { useGadgetCart } from "./GadgetCart";

export const gadgetNav = [
  "Apple Products",
  "Phones",
  "Tablets",
  "Laptops",
  "Smart Watch",
  "Earbuds & Headphones",
  "Speakers",
  "Power & Charging",
  "Gaming",
  "Cameras & Drones",
  "Smart Home",
];

export default function GadgetHeader() {
  const { count } = useGadgetCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
      <div className="container flex items-center gap-4 py-3 md:gap-8">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="text-neutral-700 lg:hidden"
        >
          <Menu className="size-6" />
        </button>

        <GadgetLogo />

        <form className="hidden flex-1 md:flex" onSubmit={(e) => e.preventDefault()}>
          <div className="flex w-full max-w-xl items-center rounded-full bg-neutral-100 px-4">
            <Search className="size-4 text-neutral-400" />
            <input
              type="search"
              placeholder="Search iPhone, AirPods, power bank..."
              className="h-10 w-full bg-transparent px-3 text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-2 md:gap-5">
          <Link href="#" className="hidden text-sm font-medium text-neutral-700 hover:text-orange-500 xl:block">
            Blog
          </Link>
          <Link
            href="#"
            className="hidden items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-orange-500 lg:flex"
          >
            <Timer className="size-4" /> Pre-order
          </Link>
          <Link
            href="#deals"
            className="hidden items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 sm:flex"
          >
            <Flame className="size-4" /> Offers
          </Link>
          <Link
            href="#"
            className="hidden items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-orange-500 lg:flex"
          >
            <GitCompare className="size-4" /> Compare
          </Link>
          <button
            aria-label={`Cart, ${count} items`}
            className="relative flex size-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-800 hover:border-orange-500 hover:text-orange-500"
          >
            <ShoppingBag className="size-[18px]" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <Link
            href="/auth/login"
            aria-label="Account"
            className="flex size-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-800 hover:border-orange-500 hover:text-orange-500"
          >
            <User className="size-[18px]" />
          </Link>
        </nav>
      </div>

      <form className="container pb-3 md:hidden" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center rounded-full bg-neutral-100 px-4">
          <Search className="size-4 text-neutral-400" />
          <input
            type="search"
            placeholder="Search gadgets..."
            className="h-10 w-full bg-transparent px-3 text-sm outline-none"
          />
        </div>
      </form>

      <div className="hidden border-t border-neutral-100 lg:block">
        <ul className="container flex items-center justify-between gap-4 overflow-x-auto py-2.5 text-[13px] text-neutral-700 [scrollbar-width:none]">
          {gadgetNav.map((item) => (
            <li key={item} className="shrink-0">
              <Link href="#categories" className="hover:text-orange-500">
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white p-5">
            <div className="flex items-center justify-between">
              <GadgetLogo />
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <ul className="mt-6 space-y-1">
              {gadgetNav.map((item) => (
                <li key={item}>
                  <Link
                    href="#categories"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    {item}
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
