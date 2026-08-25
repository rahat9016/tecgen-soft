import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Headset,
} from "lucide-react";
import Newsletter from "./Newsletter";

const shopLinks = [
  { label: "সব পণ্য", href: "/#products" },
  { label: "নতুন এসেছে", href: "/#products" },
  { label: "সর্বাধিক বিক্রিত", href: "/#products" },
  { label: "অফার", href: "/#promos" },
  { label: "ব্র্যান্ডসমূহ", href: "#" },
];

const serviceLinks = [
  { label: "Track Order", href: "/order-success" },
  { label: "Returns & Refunds", href: "#" },
  { label: "Shipping Policy", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
];

const accountLinks = [
  { label: "Login / Register", href: "/auth/login" },
  { label: "আমার অর্ডার", href: "/order-success" },
  { label: "Wishlist", href: "#" },
  { label: "অ্যাকাউন্ট সেটিংস", href: "#" },
  { label: "ঠিকানা বই", href: "#" },
];

export default function StoreFooter() {
  return (
    <footer className="bg-emerald-950 text-emerald-100">
      <Newsletter />

      <div className="container grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
        <div className="col-span-2">
          <span className="block text-xl font-extrabold text-white">
            FitStore<span className="text-amber-400">BD</span>
          </span>
          <p className="mt-3 text-sm text-emerald-200/80 max-w-xs">
            সেরা মানের পণ্য, সেরা দামে, সেরা সেবার প্রতিশ্রুতি নিয়ে আমরা আছি
            আপনার পাশে। আপনার স্মার্ট সিদ্ধান্তে পরিণত।
          </p>
          <div className="mt-4 flex items-center gap-2">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-amber-400 hover:text-emerald-950"
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </div>
        </div>

        <FooterCol title="দোকান" links={shopLinks} />
        <FooterCol title="গ্রাহক সেবা" links={serviceLinks} />
        <FooterCol title="আমার অ্যাকাউন্ট" links={accountLinks} />

        <div>
          <h4 className="font-semibold text-white">যোগাযোগ করুন</h4>
          <ul className="mt-3 space-y-3 text-sm text-emerald-200/80">
            <li className="flex items-start gap-2">
              <MapPin className="size-4 mt-0.5 shrink-0" />
              ১২৩, ঢাকা, বাংলাদেশ
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" />
              +880 1234-567890
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              support@fitstorebd.com
            </li>
            <li className="flex items-center gap-2">
              <Headset className="size-4 shrink-0" />
              24/7 Customer Support
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-4 text-center text-xs text-emerald-200/70">
          © {new Date().getFullYear()} FitStoreBD. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-semibold text-white">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-emerald-200/80">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="hover:text-amber-400">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
