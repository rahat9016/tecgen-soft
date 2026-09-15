"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, MessageCircle, X } from "lucide-react";
import logo from "@/public/logo_2.png";

const navLinks = [
  { href: "#solutions", label: "Solutions" },
  { href: "#work", label: "Our Work" },
  { href: "#pricing", label: "Pricing" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function AgencyHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src={logo}
            alt="Tecgen Soft"
            width={40}
            height={40}
            priority
            className="h-9 w-auto object-contain"
          />
          <span className="text-lg font-bold">
            <span style={{ color: "#061531" }}>Tecgen</span>{" "}
            <span style={{ color: "#3D2EF9" }}>Soft</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="#contact"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <MessageCircle className="size-4" />
            <span className="hidden sm:inline">Talk to Us</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
