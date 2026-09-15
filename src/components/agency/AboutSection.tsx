import { Facebook, Mail, MessageCircle, Phone } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { CONTACT } from "@/src/lib/contact";

export default function AboutSection() {
  return (
    <section id="about" className="py-14 md:py-18">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Who is Tecgen Soft?
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            <strong className="font-semibold text-slate-900">Tecgen Soft</strong> is a
            Bangladesh-based software development agency helping entrepreneurs and small
            businesses launch affordable digital solutions — e-commerce, hotel booking,
            business websites and more.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            আমরা কাজ করি নতুন উদ্যোক্তা, Facebook/Instagram seller, clothing ও cosmetics
            business, restaurant, hotel/resort ও service business-এর সাথে — যাদের প্রয়োজন
            budget-friendly, professional এবং সহজে পরিচালনাযোগ্য website।
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            আমাদের approach সহজ: আগে থেকে clear pricing ও scope জানানো, real demo দেখানো,
            এবং delivery-র পর নির্দিষ্ট সময় support দেওয়া — যেন আপনি নিশ্চিন্তে decision নিতে
            পারেন।
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-6 text-sm">
            <a href={CONTACT.phoneHref} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600">
              <Phone className="size-4 text-indigo-500" />
              {CONTACT.phoneDisplay}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600">
              <Mail className="size-4 text-indigo-500" />
              {CONTACT.email}
            </a>
            <a href={CONTACT.whatsappHref} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600">
              <MessageCircle className="size-4 text-indigo-500" />
              WhatsApp
            </a>
            <a href={CONTACT.facebookHref} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600">
              <Facebook className="size-4 text-indigo-500" />
              Facebook Page
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
