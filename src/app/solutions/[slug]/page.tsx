import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, LayoutDashboard, MessageCircle, Smartphone, Wrench, XCircle } from "lucide-react";

import AgencyFooter from "@/src/components/agency/AgencyFooter";
import AgencyHeader from "@/src/components/agency/AgencyHeader";
import { CONTACT } from "@/src/lib/contact";
import { SOLUTIONS, getSolution } from "@/src/lib/solutions";

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  return (
    <div className="min-h-screen bg-white">
      <AgencyHeader />
      <div className="h-16" aria-hidden="true" />

      {/* Header */}
      <section className="bg-[#061531] py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium text-indigo-300">{solution.forWho.join(" · ")}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">{solution.name}</h1>
          <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">{solution.outcome}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-white">{solution.price}</span>
            <span className="text-sm text-indigo-200">{solution.priceNote}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-indigo-300" /> Delivery: {solution.delivery}
            </span>
            <span className="flex items-center gap-2">
              <Smartphone className="size-4 text-indigo-300" /> Mobile Responsive
            </span>
            <span className="flex items-center gap-2">
              <LayoutDashboard className="size-4 text-indigo-300" /> Admin Dashboard
            </span>
            <span className="flex items-center gap-2">
              <Wrench className="size-4 text-indigo-300" /> Support: {solution.support}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {solution.image && (
              <Link
                href="#"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-indigo-50"
              >
                View Live Demo
                <ArrowRight className="size-4" />
              </Link>
            )}
            <Link
              href="#contact"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              <MessageCircle className="size-4" />
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Exactly What You Get</h2>

        <div className="mt-8 space-y-10">
          {solution.features.map((f) => (
            <div key={f.title} className="grid gap-6 sm:grid-cols-2 sm:items-center">
              {solution.image ? (
                <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                  <Image src={solution.image} alt={f.title} fill className="object-cover object-top" />
                </div>
              ) : (
                <div className="flex aspect-16/10 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
                  Screenshot coming soon
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Included vs not included */}
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Everything should be clear before you order.
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-emerald-600">Included</h3>
              <ul className="mt-4 space-y-2.5">
                {solution.included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-red-500">Not Included</h3>
              <ul className="mt-4 space-y-2.5">
                {solution.notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Need something outside the package? We&apos;ll tell you the additional cost before starting.
          </p>
        </div>
      </section>

      {/* Customer responsibility */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          What do we need from you?
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">You provide</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {solution.customerProvides.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">We handle</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {solution.weHandle.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Payment */}
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Payment</h2>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="rounded-2xl border border-indigo-200 bg-white px-6 py-4">
              <p className="text-xs text-slate-400">Project Start</p>
              <p className="text-lg font-bold text-indigo-600">৫০%</p>
            </div>
            <ArrowRight className="size-5 shrink-0 rotate-90 text-indigo-400 sm:rotate-0" />
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4">
              <p className="text-xs text-slate-400">Development</p>
              <p className="text-sm font-semibold text-slate-700">In Progress</p>
            </div>
            <ArrowRight className="size-5 shrink-0 rotate-90 text-indigo-400 sm:rotate-0" />
            <div className="rounded-2xl border border-indigo-200 bg-white px-6 py-4">
              <p className="text-xs text-slate-400">Final Delivery</p>
              <p className="text-lg font-bold text-indigo-600">৫০%</p>
            </div>
          </div>

          <ul className="mx-auto mt-10 max-w-md space-y-2 text-left text-sm text-slate-600">
            <li>• Domain ownership: আপনার নামে registered থাকবে।</li>
            <li>• Hosting ownership: আপনার account-এ setup করা হয়।</li>
            <li>• Source code: সম্পূর্ণ পেমেন্টের পর আপনাকে দেওয়া হয়।</li>
            <li>• Renewal cost: Domain ও hosting renewal আপনার নিজের খরচে।</li>
            <li>• Support period: {solution.support}, এরপর optional মাসিক support।</li>
            <li>• Additional features: প্রতিটির খরচ আগে থেকে জানিয়ে দেওয়া হয়।</li>
          </ul>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden bg-indigo-700 py-16 md:py-20">
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            আপনার business idea আমাদের বলুন।
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
            আপনার business, budget এবং requirements শুনে আমরা আপনাকে suitable solution suggest করব।
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={CONTACT.whatsappHref}
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-500 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600"
            >
              <MessageCircle className="size-4" />
              WhatsApp / Messenger
            </Link>
            <Link
              href={CONTACT.phoneHref}
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Call Us
            </Link>
          </div>
        </div>
      </section>

      <AgencyFooter />
    </div>
  );
}
