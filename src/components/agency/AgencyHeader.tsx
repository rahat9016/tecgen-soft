"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, MessageCircle, X } from "lucide-react";
import logo from "@/public/logo_2.png";

const navLinks = [
  { href: "/#solutions", label: "Solutions" },
  { href: "/#work", label: "Our Work" },
  { href: "/#solutions", label: "Pricing" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

/** `overlay`: start fully transparent over a dark hero and turn into glass once the page scrolls. */
export default function AgencyHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const solid = !overlay || scrolled || open;

  // switch to the glass bar once content starts sliding underneath
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3">
      {/* same container as the page sections, so the bar lines up with their edges */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`flex h-14 items-center justify-between rounded-2xl border pr-2 pl-4 transition-all duration-300 sm:pl-5 ${
            !solid ? "border-transparent" : overlay ? "glass-strong bg-black/60" : "glass-strong bg-black/85"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <Image
              src={logo}
              alt="Tecgen Soft"
              width={40}
              height={40}
              priority
              className="h-8 w-auto object-contain"
            />
            <span className="text-lg font-bold whitespace-nowrap">
              <span className="text-white">Tecgen</span>{" "}
              <span className="text-[#8F87FF]">Soft</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/#contact"
              className="hidden h-10 items-center gap-1.5 rounded-xl bg-white px-5 text-sm font-medium whitespace-nowrap text-[#0a0a0a] shadow-[0_10px_30px_-10px_rgba(255,255,255,0.45)] transition hover:bg-neutral-200 md:inline-flex"
            >
              <MessageCircle className="size-4" />
              Get a Quote
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="inline-flex size-10 items-center justify-center rounded-xl text-neutral-200 transition hover:bg-white/10 lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="glass-strong mt-2 rounded-2xl bg-black/75 p-2 lg:hidden">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-200 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
