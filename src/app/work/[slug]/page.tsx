import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  LayoutDashboard,
  MessageCircle,
  Smartphone,
} from "lucide-react";

import AgencyFooter from "@/src/components/agency/AgencyFooter";
import AgencyHeader from "@/src/components/agency/AgencyHeader";
import BrowserFrame from "@/src/components/agency/BrowserFrame";
import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";
import { CONTACT } from "@/src/lib/contact";
import { PROJECTS, getProject } from "@/src/lib/projects";
import { getSolution } from "@/src/lib/solutions";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const solution = getSolution(project.solutionSlug);
  const otherProjects = PROJECTS.filter((p) => p.slug !== project.slug);

  return (
    <div className="min-h-screen bg-white">
      <AgencyHeader />
      <div className="h-16" aria-hidden="true" />

      {/* Header + showcase */}
      <section className="bg-slate-50 py-10 md:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/#work"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft className="size-3.5" />
            Our Work
          </Link>

          <Reveal className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {project.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    project.status === "Client Project"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {project.name}
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-500">
                {project.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href={project.liveHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Visit Live Demo
                <ExternalLink className="size-4" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                <MessageCircle className="size-4" />
                Talk to Us
              </Link>
            </div>
          </Reveal>

          <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2">
            {project.gallery.map((shot) => (
              <StaggerItem key={shot.label} className="min-w-0">
                <BrowserFrame
                  title={shot.href}
                  src={shot.image}
                  className="w-full shadow-xl shadow-slate-900/10"
                  badge={
                    <Link
                      href={shot.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Open <ExternalLink className="size-3" />
                    </Link>
                  }
                />
                <p className="mt-2.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {shot.label}
                </p>
              </StaggerItem>
            ))}
          </StaggerGrid>

          <Reveal
            delay={0.1}
            className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-center"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Smartphone className="size-3.5 text-indigo-500" />
              Mobile Responsive
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <LayoutDashboard className="size-3.5 text-indigo-500" />
              Admin Dashboard Included
            </span>
          </Reveal>
        </div>
      </section>

      {solution && (
        <>
          {/* What's built */}
          <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                What&apos;s Built Into This Project
              </h2>
              <p className="mt-3 text-base text-slate-500">
                Every module below is live and working in the demo above.
              </p>
            </Reveal>

            <StaggerGrid className="mt-10 grid gap-5 sm:grid-cols-2">
              {solution.features.map(({ title, desc }) => (
                <StaggerItem
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <CheckCircle2 className="size-5" />
                  </span>
                  <h3 className="mt-3.5 text-base font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </section>

          {/* Everything included */}
          <section className="bg-slate-50 py-14 md:py-18">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <Reveal>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Everything Included
                </h2>
              </Reveal>
              <Reveal delay={0.1} className="mt-6 flex flex-wrap justify-center gap-2.5">
                {solution.included.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </Reveal>
            </div>
          </section>

          {/* Get this package CTA */}
          <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-8 sm:flex-row sm:p-10">
              <div>
                <p className="text-sm font-semibold text-indigo-600">Want a website like this?</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                  {solution.name} — starting at {solution.price}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {solution.priceNote} · Delivery in {solution.delivery}
                </p>
              </div>
              <Link
                href={`/solutions/${solution.slug}`}
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                See Full Package
                <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </section>
        </>
      )}

      {/* Other projects */}
      {otherProjects.length > 0 && (
        <section className="bg-slate-50 py-14 md:py-18">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                More Projects
              </h2>
            </Reveal>

            <StaggerGrid className="mt-8 grid gap-5 sm:grid-cols-2">
              {otherProjects.map((p) => (
                <StaggerItem key={p.slug}>
                  <Link
                    href={`/work/${p.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
                  >
                    <div className="relative aspect-4/3 w-28 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover object-top transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-indigo-600">{p.category}</p>
                      <h3 className="mt-0.5 text-sm font-semibold text-slate-900">{p.name}</h3>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-indigo-600">
                        View Case Study
                        <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      <section
        id="contact"
        className="relative overflow-hidden bg-linear-to-br from-[#3D2EF9] via-[#4732e8] to-[#061531] py-16 md:py-20"
      >
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
