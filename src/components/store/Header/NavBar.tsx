"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Zap, ChevronDown } from "lucide-react";
import { categories } from "@/src/data/categories";
import { navLinks } from "./navLinks";
import { cn } from "@/src/lib/utils";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="hidden lg:block border-t border-b border-neutral-100 bg-white">
      <div className="container grid grid-cols-[auto_1fr_auto] items-center gap-6 py-3">
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className="flex items-center gap-2 pr-6 text-sm font-medium text-neutral-800 hover:text-emerald-700"
          >
            <Menu className="size-4" />
            সব ক্যাটেগরি
            <ChevronDown className="size-3.5" />
          </button>
          <span className="absolute right-0 top-1/2 h-5 w-px -translate-y-1/2 bg-neutral-200" />

          {open && (
            <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-md border border-neutral-100 bg-white py-2 shadow-lg">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href="/ecommerce#categories"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <cat.icon className="size-4" />
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="flex items-center justify-center gap-6 text-sm text-neutral-700">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "hover:text-emerald-700",
                pathname === link.href
                  ? "font-semibold text-neutral-900"
                  : "font-medium"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/ecommerce#products"
          className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
        >
          <Zap className="size-4 fill-emerald-700" />
          Today&apos;s Deals
        </Link>
      </div>
    </div>
  );
}
