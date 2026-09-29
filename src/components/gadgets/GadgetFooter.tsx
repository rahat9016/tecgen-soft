import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import GadgetLogo from "./GadgetLogo";

const outlets = [
  "Bashundhara City Shopping Complex, Level 5, Panthapath, Dhaka",
  "Jamuna Future Park, Level 4, Zone A, Kuril, Dhaka",
  "Multiplan Center, Level 6, New Elephant Road, Dhaka",
];

const columns = [
  { title: "About Us", links: ["About Us", "Corporate", "Careers", "Blog", "Press Coverage", "Contact Us"] },
  {
    title: "Policy",
    links: ["EMI & Payment Policy", "Warranty Policy", "Exchange Policy", "Delivery Policy", "Refund Policy"],
  },
  { title: "Mobile Phones", links: ["iPhone", "Samsung", "Google Pixel", "Xiaomi", "OnePlus"] },
  { title: "Accessories", links: ["Earbuds", "Headphones", "Power Bank", "Chargers", "Smart Watch"] },
  { title: "Top Brands", links: ["Apple", "Samsung", "Sony", "JBL", "DJI", "Anker"] },
];

export default function GadgetFooter() {
  return (
    <footer className="mt-20 bg-neutral-950 text-neutral-400">
      <div className="container grid gap-10 py-14 lg:grid-cols-[1.2fr_1.3fr_2.5fr]">
        <div>
          <GadgetLogo light />
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-orange-500" /> 09612-345678
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-orange-500" /> support@gadgethub.com.bd
            </li>
          </ul>
          <div className="mt-6 flex gap-2">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                aria-label="Social link"
                className="flex size-9 items-center justify-center rounded-full border border-neutral-800 hover:border-orange-500 hover:text-orange-500"
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Outlets</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {outlets.map((o) => (
              <li key={o} className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-orange-500" /> {o}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="hover:text-orange-400">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-900">
        <div className="container flex flex-col gap-2 py-5 text-xs sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} gadgethub. All rights reserved. Demo store by Tecgen Soft.</p>
          <p>Product photos: Wikimedia Commons contributors</p>
        </div>
      </div>
    </footer>
  );
}
