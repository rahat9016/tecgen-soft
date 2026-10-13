import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Facebook, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import logo from "@/public/logo_2.png";
import { CONTACT } from "@/src/lib/contact";
import { SOLUTIONS } from "@/src/lib/solutions";

const companyLinks = [
  { href: "/#work", label: "Our Work" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#solutions", label: "Pricing" },
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

const socials = [
  { icon: Facebook, label: "Facebook", href: CONTACT.facebookHref },
  { icon: MessageCircle, label: "WhatsApp", href: CONTACT.whatsappHref },
  { icon: Mail, label: "Email", href: `mailto:${CONTACT.email}` },
  { icon: Phone, label: "Call", href: CONTACT.phoneHref },
];

const heading = "text-xs font-semibold tracking-wider text-neutral-500 uppercase";
const link = "text-sm text-neutral-300 transition hover:text-white";

export default function AgencyFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0a0a0a]">
      <div className="pointer-events-none absolute -top-32 left-1/4 size-96 rounded-full bg-[#3D2EF9]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 size-80 rounded-full bg-white/[0.04] blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-12 lg:px-8">
        <div className="glass grid gap-8 rounded-3xl p-6 sm:grid-cols-2 sm:gap-10 sm:p-10 lg:grid-cols-[1.3fr_1.45fr_0.7fr_1.15fr]">
          {/* brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src={logo} alt="Tecgen Soft" width={40} height={40} className="h-9 w-auto object-contain" />
              <span className="text-lg font-bold">
                <span className="text-white">Tecgen</span> <span className="text-[#8F87FF]">Soft</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Hotel, e-commerce ও turf business-এর জন্য ready-made software — সহজ মাসিক subscription-এ, hosting ও
              support সহ।
            </p>
            <div className="mt-6 flex gap-2.5">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-neutral-300 transition hover:-translate-y-0.5 hover:border-transparent hover:bg-[#3D2EF9] hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* products */}
          <div>
            <h4 className={heading}>Products</h4>
            <ul className="mt-4 space-y-3">
              {SOLUTIONS.map(({ slug, name, price }) => (
                <li key={slug}>
                  <Link href={`/solutions/${slug}`} className="group flex items-baseline justify-between gap-3">
                    <span className={`${link} group-hover:text-white`}>{name}</span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      <span className="font-semibold text-indigo-300">{price}</span>/মাস
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* company */}
          <div>
            <h4 className={heading}>Company</h4>
            <ul className="mt-4 space-y-3">
              {companyLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className={link}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className={heading}>Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-neutral-300">
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-indigo-300" />
                <a href={CONTACT.phoneHref} className={link}>
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-indigo-300" />
                <a href={`mailto:${CONTACT.email}`} className={link}>
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="size-4 shrink-0 text-indigo-300" />
                <a href={CONTACT.whatsappHref} className={link} target="_blank" rel="noopener noreferrer">
                  WhatsApp / Messenger
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-indigo-300" />
                Dhaka, Bangladesh
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 px-2 sm:mt-8 sm:flex-row">
          <p className="text-xs text-neutral-500">© {new Date().getFullYear()} Tecgen Soft. All rights reserved.</p>
          <a
            href="#"
            className="group inline-flex items-center gap-1.5 text-xs text-neutral-500 transition hover:text-white"
          >
            Back to top
            <ArrowUp className="size-3.5 transition group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* oversized wordmark, fading into the page bottom */}
        <p
          aria-hidden="true"
          className="pointer-events-none mt-6 -mb-[0.22em] bg-linear-to-b from-white/[0.08] to-transparent bg-clip-text text-center text-[14vw] leading-none font-bold tracking-tighter whitespace-nowrap text-transparent select-none lg:text-[13rem]"
        >
          Tecgen Soft
        </p>
      </div>
    </footer>
  );
}
