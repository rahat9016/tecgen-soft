"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Zap, Heart, User } from "lucide-react";
import { categories } from "@/src/data/categories";
import { navLinks } from "./navLinks";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex items-center justify-center text-neutral-800 lg:hidden"
      >
        <Menu className="size-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4">
              <span className="text-lg font-bold text-neutral-900">মেনু</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex size-8 items-center justify-center rounded-full hover:bg-neutral-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col p-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-neutral-800 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/ecommerce#products"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700"
              >
                <Zap className="size-4 fill-emerald-700" />
                Today&apos;s Deals
              </Link>
            </nav>

            <div className="border-t border-neutral-100 p-2">
              <p className="px-3 py-2 text-xs font-semibold uppercase text-neutral-400">
                ক্যাটেগরি সমূহ
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href="/ecommerce#categories"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <cat.icon className="size-4" />
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-neutral-100 p-2">
              <Link
                href="#"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Heart className="size-4" />
                Wishlist
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <User className="size-4" />
                Login / Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
