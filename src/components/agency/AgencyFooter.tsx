import Image from "next/image";
import Link from "next/link";
import { Facebook, Mail, MessageCircle, Phone } from "lucide-react";
import logo from "@/public/logo_2.png";
import { CONTACT } from "@/src/lib/contact";

export default function AgencyFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0a0a0a]">
      <div className="pointer-events-none absolute -top-32 left-1/4 size-96 rounded-full bg-white/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 size-80 rounded-full bg-white/[0.04] blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="glass grid gap-10 rounded-3xl p-7 sm:grid-cols-2 sm:p-10 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={logo}
                alt="Tecgen Soft"
                width={40}
                height={40}
                className="h-9 w-auto object-contain"
              />
              <span className="text-lg font-bold">
                <span className="text-white">Tecgen</span> <span className="text-[#8F87FF]">Soft</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              নতুন ব্যবসা শুরু করছেন? সাশ্রয়ী মাসিক subscription-এ আপনার ব্যবসার জন্য ready
              website — hosting, updates ও support সহ।
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Solutions</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-400">
              <li><Link href="/solutions/hotel-booking" className="transition hover:text-indigo-300">Hotel Booking Management</Link></li>
              <li><Link href="/solutions/gadget-ecommerce" className="transition hover:text-indigo-300">Gadget E-commerce</Link></li>
              <li><Link href="/solutions/ecommerce" className="transition hover:text-indigo-300">Fashion E-commerce</Link></li>
              <li><Link href="/solutions/turf-booking" className="transition hover:text-indigo-300">Turf Booking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-400">
              <li><Link href="/#work" className="transition hover:text-indigo-300">Our Work</Link></li>
              <li><Link href="/#about" className="transition hover:text-indigo-300">About</Link></li>
              <li><Link href="/#contact" className="transition hover:text-indigo-300">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-indigo-300" />
                <a href={CONTACT.phoneHref} className="transition hover:text-indigo-300">{CONTACT.phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-indigo-300" />
                <a href={`mailto:${CONTACT.email}`} className="transition hover:text-indigo-300">{CONTACT.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="size-4 shrink-0 text-indigo-300" />
                <a href={CONTACT.whatsappHref} className="transition hover:text-indigo-300">WhatsApp / Messenger</a>
              </li>
              <li className="flex items-center gap-2">
                <Facebook className="size-4 shrink-0 text-indigo-300" />
                <a href={CONTACT.facebookHref} className="transition hover:text-indigo-300" target="_blank" rel="noopener noreferrer">
                  Facebook Page
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 px-2 sm:flex-row">
          <p className="text-xs text-neutral-500">© {new Date().getFullYear()} Tecgen Soft. All rights reserved.</p>
          <p className="text-xs text-neutral-500">Made in Bangladesh 🇧🇩 for Bangladeshi entrepreneurs.</p>
        </div>
      </div>
    </footer>
  );
}
