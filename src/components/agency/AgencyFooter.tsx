import Link from "next/link";
import { Code2, Facebook, Mail, MessageCircle, Phone } from "lucide-react";

export default function AgencyFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-1.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Code2 className="size-5" />
              </span>
              <span className="text-lg font-bold text-slate-900">
                Tecgen <span className="text-indigo-600">Soft</span>
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
              <li><Link href="#solutions" className="hover:text-indigo-600">Our Solutions</Link></li>
              <li><Link href="#pricing" className="hover:text-indigo-600">Pricing</Link></li>
              <li><Link href="#contact" className="hover:text-indigo-600">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2"><Phone className="size-4 text-indigo-500" /> +880 1XXX-XXXXXX</li>
              <li className="flex items-center gap-2"><Mail className="size-4 text-indigo-500" /> hello@tecgensoft.com</li>
              <li className="flex items-center gap-2"><MessageCircle className="size-4 text-indigo-500" /> WhatsApp / Messenger</li>
              <li className="flex items-center gap-2"><Facebook className="size-4 text-indigo-500" /> Facebook Page</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} TecgenSoft. All rights reserved.</p>
          <p className="text-xs text-slate-400">Made in Bangladesh 🇧🇩 for Bangladeshi entrepreneurs.</p>
        </div>
      </div>
    </footer>
  );
}
