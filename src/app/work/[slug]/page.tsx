import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Headset,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  Palette,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Tags,
} from "lucide-react";

import AgencyFooter from "@/src/components/agency/AgencyFooter";
import AgencyHeader from "@/src/components/agency/AgencyHeader";
import ProjectGallery from "@/src/components/agency/ProjectGallery";
import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";
import { CONTACT } from "@/src/lib/contact";
import { PROJECTS, getProject } from "@/src/lib/projects";
import { getSolution } from "@/src/lib/solutions";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

/** best-effort icon match for a real "included" line — falls back to a plain check */
function iconForIncluded(item: string): LucideIcon {
  const t = item.toLowerCase();
  if (t.includes("dashboard")) return LayoutDashboard;
  if (t.includes("responsive")) return Smartphone;
  if (t.includes("design")) return Palette;
  if (t.includes("category") || t.includes("categories")) return Tags;
  if (t.includes("seo")) return Search;
  if (t.includes("deploy")) return Rocket;
  if (t.includes("train")) return GraduationCap;
  if (t.includes("support")) return Headset;
  return CheckCircle2;
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

  const hasResponsive = solution?.included.some((i) => /responsive/i.test(i)) ?? true;
  const hasAdminDashboard = solution?.included.some((i) => /dashboard/i.test(i)) ?? false;

  const stats = [
    { icon: Boxes, label: "Project Type", value: project.category },
    {
      icon: ListChecks,
      label: "Core Modules",
      value: solution ? `${solution.features.length}+ Integrated Modules` : "Custom Build",
    },
    { icon: Smartphone, label: "Responsive", value: hasResponsive ? "Desktop + Mobile" : "Desktop" },
    { icon: LayoutDashboard, label: "Admin Dashboard", value: hasAdminDashboard ? "Included" : "Not Included" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <AgencyHeader />
      <div className="h-16" aria-hidden="true" />

      {/* Full project walkthrough — masonry gallery, shown first */}
      {project.gallery.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                Project Walkthrough
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Explore Every Part of the Project
              </h2>
              <p className="mt-4 text-base text-slate-500 sm:text-lg">
                From {project.gallery[0].label.toLowerCase()} to{" "}
                {project.gallery[project.gallery.length - 1].label.toLowerCase()}, every essential
                module is designed and connected. Click any screenshot to view it full size.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-12">
              <ProjectGallery shots={project.gallery} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Hero */}
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
              {project.category}
              <span className="size-1 rounded-full bg-indigo-300" />
              Web Development
            </span>
            <h1 className="mt-5 text-4xl leading-[1.08] font-bold tracking-tight text-slate-900 sm:text-6xl">
              {project.name}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {project.description}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={project.liveHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-13 items-center gap-2 rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30"
              >
                View Live Demo
                <ExternalLink className="size-4" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex h-13 items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
              >
                <MessageCircle className="size-4" />
                Talk to Us
              </Link>
            </div>
          </Reveal>

          {/* Project metadata bar */}
          <Reveal delay={0.1} className="mt-12">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-7 rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-slate-200 sm:px-8 sm:py-8">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center gap-2.5 text-center sm:px-6">
                  <span className="flex size-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Icon className="size-4.5" />
                  </span>
                  <p className="text-base font-bold text-slate-900 sm:text-lg">{value}</p>
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {solution && (
        <>
          {/* What's built */}
          <section className="px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Reveal className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  What&apos;s Built Into This Project
                </h2>
                <p className="mt-4 text-base text-slate-500 sm:text-lg">
                  Every module below is live and working in the demo above.
                </p>
              </Reveal>

              <StaggerGrid className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {solution.features.map(({ title, desc }, i) => (
                  <StaggerItem
                    key={title}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1.5 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-900/8"
                  >
                    <span className="pointer-events-none absolute top-2 right-5 text-6xl font-bold text-slate-100 transition group-hover:text-indigo-50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <CheckCircle2 className="size-6" />
                    </span>
                    <h3 className="relative mt-5 text-lg font-bold text-slate-900">{title}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>
          </section>

          {/* How the system works */}
          {project.journey && project.journey.length > 0 && (
            <section className="bg-slate-50 px-4 py-20 sm:px-6 md:py-28 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <Reveal className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                    How This Website Works
                  </h2>
                  <p className="mt-4 text-base text-slate-500 sm:text-lg">
                    The complete flow, from a visitor&apos;s first click to a finished order.
                  </p>
                </Reveal>

                <div className="relative mt-16">
                  <div className="absolute top-7 right-0 left-0 hidden h-0.5 bg-linear-to-r from-indigo-100 via-indigo-300 to-indigo-100 lg:block" />
                  <StaggerGrid className="grid gap-y-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-6">
                    {project.journey.map((step, i) => (
                      <StaggerItem key={step} className="relative text-center">
                        <div className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-full bg-indigo-600 text-base font-bold text-white shadow-lg shadow-indigo-600/25 ring-4 ring-white">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <h3 className="mt-5 text-base font-semibold text-slate-900">{step}</h3>
                      </StaggerItem>
                    ))}
                  </StaggerGrid>
                </div>
              </div>
            </section>
          )}

          {/* Everything included */}
          <section className="py-20 md:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <Reveal className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Everything Included
                </h2>
                <p className="mt-3 text-sm text-slate-500 sm:text-base">
                  Exactly what you get with the {solution.name.toLowerCase()} package — no surprises.
                </p>
              </Reveal>
              <StaggerGrid className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {solution.included.map((item) => {
                  const Icon = iconForIncluded(item);
                  return (
                    <StaggerItem
                      key={item}
                      className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-5 py-4.5 transition hover:border-indigo-100 hover:bg-indigo-50/40"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="text-[15px] font-medium text-slate-700">{item}</span>
                    </StaggerItem>
                  );
                })}
              </StaggerGrid>
            </div>
          </section>

          {/* Get this package CTA */}
          <section className="bg-indigo-50/50 px-4 py-20 sm:px-6 md:py-24 lg:px-8">
            <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.18)] sm:p-12">
              <div className="pointer-events-none absolute top-0 right-0 size-64 rounded-full bg-indigo-100/50 blur-[80px]" />
              <div className="relative flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                    Want a website like this?
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
                    {solution.name}
                  </h3>
                  <p className="mt-2 text-3xl font-extrabold text-indigo-600 sm:text-4xl">
                    Starting from {solution.price}
                  </p>
                  <p className="mt-3 text-sm text-slate-500 sm:text-base">
                    {solution.included.slice(0, 3).join(" · ")} · Delivery in {solution.delivery}
                  </p>
                </div>
                <Link
                  href={`/solutions/${solution.slug}`}
                  className="inline-flex h-14 shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
                >
                  See Full Package
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          </section>
        </>
      )}

      {/* Other projects */}
      {otherProjects.length > 0 && (
        <section className="bg-slate-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                More Projects
              </h2>
              <p className="mt-3 text-sm text-slate-500 sm:text-base">Other demo builds worth a look.</p>
            </Reveal>

            {otherProjects.length === 1 ? (
              <Reveal delay={0.1} className="mx-auto mt-12 max-w-5xl">
                <Link
                  href={`/work/${otherProjects[0].slug}`}
                  className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-900/5 transition hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-900/15 sm:grid-cols-2"
                >
                  <div className="relative aspect-16/10 sm:aspect-auto sm:min-h-104">
                    <Image
                      src={otherProjects[0].image}
                      alt={otherProjects[0].name}
                      fill
                      className="object-cover object-top transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-8 sm:p-12">
                    <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
                      {otherProjects[0].category}
                    </span>
                    <h3 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                      {otherProjects[0].name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
                      {otherProjects[0].description}
                    </p>
                    <span className="mt-7 inline-flex h-12 w-fit items-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition group-hover:bg-indigo-700">
                      View Case Study
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ) : (
              <StaggerGrid className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {otherProjects.map((p) => (
                  <StaggerItem key={p.slug}>
                    <Link
                      href={`/work/${p.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-900/10"
                    >
                      <div className="relative aspect-16/10 overflow-hidden">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover object-top transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                          {p.category}
                        </p>
                        <h3 className="mt-1.5 text-base font-semibold text-slate-900">{p.name}</h3>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                          {p.description}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                          View Case Study
                          <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            )}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section
        id="contact"
        className="relative overflow-hidden bg-linear-to-br from-[#3D2EF9] via-[#4732e8] to-[#061531] py-20 md:py-28"
      >
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-indigo-400/25 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-blue-500/15 blur-[100px]" />

        <Reveal className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur-sm">
            <ShieldCheck className="size-3.5" />
            আজই শুরু করুন
          </span>
          <h2 className="mt-6 text-3xl leading-snug font-bold tracking-tight text-white sm:text-5xl">
            আপনার ব্যবসার জন্য এমন একটি website তৈরি করুন
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-loose text-indigo-100 sm:text-base">
            আপনার business idea, budget এবং requirements অনুযায়ী আমরা তৈরি করি professional digital
            solutions।
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href={CONTACT.whatsappHref}
              className="inline-flex h-13 items-center gap-2 rounded-xl bg-emerald-500 px-7 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              <MessageCircle className="size-4" />
              WhatsApp / Messenger
            </Link>
            <Link
              href={CONTACT.phoneHref}
              className="inline-flex h-13 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Phone className="size-4" />
              Call Us
            </Link>
          </div>
        </Reveal>
      </section>

      <AgencyFooter />
    </div>
  );
}
