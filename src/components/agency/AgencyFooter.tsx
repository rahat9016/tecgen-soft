import Image from "next/image";
import Link from "next/link";
import { Facebook, Mail, MessageCircle, Phone } from "lucide-react";
import logo from "@/public/logo_2.png";
import { CONTACT } from "@/src/lib/contact";

export default function AgencyFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
                <span style={{ color: "#061531" }}>Tecgen</span>{" "}
                <span style={{ color: "#3D2EF9" }}>Soft</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              নতুন ব্যবসা শুরু করছেন? আপনার বাজেটের মধ্যে প্রয়োজনীয় ওয়েবসাইট ও সফটওয়্যার আমরা
              তৈরি করে দিচ্ছি।
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Solutions</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/solutions/ecommerce" className="hover:text-indigo-600">E-commerce Website</Link></li>
              <li><Link href="/solutions/hotel-booking" className="hover:text-indigo-600">Hotel Booking Website</Link></li>
              <li><Link href="/solutions/business-website" className="hover:text-indigo-600">Business Website</Link></li>
              <li><Link href="/solutions/restaurant" className="hover:text-indigo-600">Restaurant Website</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="#work" className="hover:text-indigo-600">Our Work</Link></li>
              <li><Link href="#about" className="hover:text-indigo-600">About</Link></li>
              <li><Link href="#pricing" className="hover:text-indigo-600">Pricing</Link></li>
              <li><Link href="#contact" className="hover:text-indigo-600">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-indigo-500" />
                <a href={CONTACT.phoneHref} className="hover:text-indigo-600">{CONTACT.phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-indigo-500" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-indigo-600">{CONTACT.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="size-4 text-indigo-500" />
                <a href={CONTACT.whatsappHref} className="hover:text-indigo-600">WhatsApp / Messenger</a>
              </li>
              <li className="flex items-center gap-2">
                <Facebook className="size-4 text-indigo-500" />
                <a href={CONTACT.facebookHref} className="hover:text-indigo-600" target="_blank" rel="noopener noreferrer">
                  Facebook Page
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Tecgen Soft. All rights reserved.</p>
          <p className="text-xs text-slate-400">Made in Bangladesh 🇧🇩 for Bangladeshi entrepreneurs.</p>
        </div>
      </div>
    </footer>
  );
}
