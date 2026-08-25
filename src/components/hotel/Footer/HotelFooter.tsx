import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { footerLinks, paymentMethods } from "@/src/data/hotelHome";

export default function HotelFooter() {
  return (
    <footer className="mt-8 bg-sky-950 text-sky-100 print:hidden">
      <div className="container grid gap-8 py-12 md:grid-cols-6">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌴</span>
            <span className="text-lg font-extrabold text-white">TripWave</span>
          </div>
          <p className="mt-1 text-xs font-medium text-sky-300">Hotel &amp; Resort Booking</p>
          <p className="mt-3 text-sm text-sky-200">
            Your trusted travel partner for hotels, resorts, cottages and more across
            Bangladesh.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-amber-400 hover:text-sky-950"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sky-300">
            {footerLinks.company.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-amber-400">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-white">Support</p>
          <ul className="mt-3 space-y-2 text-sky-300">
            {footerLinks.support.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-amber-400">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-white">For Partners</p>
          <ul className="mt-3 space-y-2 text-sky-300">
            {footerLinks.partners.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-amber-400">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-white">Contact Us</p>
          <ul className="mt-3 space-y-2 text-sky-300">
            <li className="flex items-center gap-2">
              <Phone className="size-3.5 shrink-0" /> +880-1880-982822
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-3.5 shrink-0" /> info@tripwave.com
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
              House-12, Road-5, Dhanmondi, Dhaka-1205, Bangladesh
            </li>
          </ul>

          <p className="mt-4 font-semibold text-white">Payment Methods</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="rounded border border-sky-800 bg-sky-900 px-2 py-1 text-[10px] font-semibold text-sky-100"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-sky-900 py-4 text-center text-xs text-sky-400">
        © {new Date().getFullYear()} TripWave. All rights reserved.
      </div>
    </footer>
  );
}
