import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import logo from "@/public/logo_2.png";

const navLinks = [
  { href: "#solutions", label: "Solutions" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export default function AgencyHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
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

        <Link
          href="#contact"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <MessageCircle className="size-4" />
          <span className="hidden sm:inline">Talk to Us</span>
        </Link>
      </div>
    </header>
  );
}
