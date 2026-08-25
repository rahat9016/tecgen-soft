"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Zap, ChevronDown } from "lucide-react";
import { categories } from "@/src/data/categories";

const navLinks = [
  { label: "হোম", href: "/" },
  { label: "দোকান", href: "/#products" },
  { label: "অফার", href: "/#promos" },
  { label: "নতুন এসেছে", href: "/#products" },
  { label: "সর্বাধিক বিক্রিত", href: "/#products" },
  { label: "ব্র্যান্ড", href: "#" },
  { label: "ব্লগ", href: "#" },
  { label: "যোগাযোগ", href: "#" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-b border-neutral-100 bg-white">
      <div className="container flex items-center gap-8 py-3">
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className="flex items-center gap-2 rounded-md bg-emerald-950 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900"
          >
            <Menu className="size-4" />
            সব ক্যাটেগরি
            <ChevronDown className="size-3.5" />
          </button>

          {open && (
            <div className="absolute left-0 top-full z-30 mt-1 w-72 rounded-md border border-neutral-100 bg-white py-2 shadow-lg">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href="/#categories"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <cat.icon className="size-4" />
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-700">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-emerald-800">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/#products"
          className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
        >
          <Zap className="size-4 fill-emerald-800" />
          Today&apos;s Deals
        </Link>
      </div>
    </div>
  );
}
