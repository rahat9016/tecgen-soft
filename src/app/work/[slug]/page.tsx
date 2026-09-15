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
  Monitor,
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
import BrowserFrame from "@/src/components/agency/BrowserFrame";
import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";
import { CONTACT } from "@/src/lib/contact";
import { PROJECTS, getProject, type Project } from "@/src/lib/projects";
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

function GalleryCard({
  shot,
  size = "md",
}: {
  shot: Project["gallery"][number];
  size?: "lg" | "md";
}) {
  return (
    <Link
      href={shot.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
    >
      <div
        className={`relative w-full overflow-hidden ${size === "lg" ? "aspect-16/9" : "aspect-4/3"}`}
      >
        <Image
          src={shot.image}
          alt={shot.label}
          fill
          className="object-cover object-top transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-end bg-linear-to-t from-slate-900/60 via-slate-900/0 to-slate-900/0 opacity-0 transition group-hover:opacity-100">
          <span className="m-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900">
            Open Live Page
            <ExternalLink className="size-3.5" />
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{shot.label}</p>
        <ExternalLink className="size-3.5 text-slate-400 transition group-hover:text-indigo-600" />
      </div>
    </Link>
  );
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
    { icon: Monitor, label: "Platform", value: "Custom Web Application" },
    {
      icon: ListChecks,
      label: "Key Modules",
      value: solution ? `${solution.features.length}+ Modules` : "—",
    },
    { icon: Smartphone, label: "Responsive", value: hasResponsive ? "Yes" : "—" },
  ];

  const primaryShot = project.gallery[0];
  const restShots = project.gallery.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <AgencyHeader />
      <div className="h-16" aria-hidden="true" />

      {/* Hero */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
              {project.category} / Web Development
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {project.name}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
              {project.description}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href={project.liveHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
              >
                View Live Demo
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

          {/* Premium screenshot showcase */}
          <div className="relative mt-14 sm:mt-16">
            {primaryShot && (
              <Reveal>
                <BrowserFrame
                  title={primaryShot.label}
                  src={primaryShot.image}
                  className="w-full shadow-2xl shadow-slate-900/15"
                  badge={
                    <Link
                      href={primaryShot.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Open <ExternalLink className="size-3" />
                    </Link>
                  }
                />
              </Reveal>
            )}
            {restShots[0] && (
              <Reveal
                delay={0.15}
                className="relative z-10 mt-6 ml-auto w-full sm:mt-[-4.5rem] sm:w-[62%] lg:w-[46%]"
              >
                <BrowserFrame
                  title={restShots[0].label}
                  src={restShots[0].image}
                  className="w-full shadow-2xl shadow-slate-900/20 ring-4 ring-white"
                  badge={
                    <Link
                      href={restShots[0].href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Open <ExternalLink className="size-3" />
                    </Link>
                  }
                />
              </Reveal>
            )}
          </div>

          {/* Project stats bar */}
          <Reveal delay={0.1} className="mt-10 sm:mt-12">
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-slate-200 sm:p-6">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center sm:px-4">
                  <Icon className="size-4 text-indigo-500" />
                  <p className="text-sm font-semibold text-slate-900">{value}</p>
                  <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {hasAdminDashboard && (
            <Reveal
              delay={0.15}
              className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-center"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <LayoutDashboard className="size-3.5 text-indigo-500" />
                Admin Dashboard Included
              </span>
            </Reveal>
          )}
        </div>
      </section>

      {/* Full project walkthrough */}
      {project.gallery.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                Project Walkthrough
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Explore Every Part of the Project
              </h2>
              <p className="mt-3 text-base text-slate-500">
                From {project.gallery[0].label.toLowerCase()} to{" "}
                {project.gallery[project.gallery.length - 1].label.toLowerCase()}, every essential
                module is designed and connected.
              </p>
            </Reveal>

            <div className="mt-10 space-y-6">
              {primaryShot && (
                <Reveal>
                  <GalleryCard shot={primaryShot} size="lg" />
                </Reveal>
              )}
              {restShots.length > 0 && (
                <StaggerGrid
                  className={`grid gap-6 ${restShots.length > 1 ? "sm:grid-cols-2" : "sm:mx-auto sm:max-w-2xl"}`}
                >
                  {restShots.map((shot) => (
                    <StaggerItem key={shot.label}>
                      <GalleryCard shot={shot} />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              )}
            </div>
          </div>
        </section>
      )}

      {solution && (
        <>
          {/* What's built */}
          <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Reveal className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  What&apos;s Built Into This Project
                </h2>
                <p className="mt-3 text-base text-slate-500">
                  Every module below is live and working in the demo above.
                </p>
              </Reveal>

              <StaggerGrid className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {solution.features.map(({ title, desc }, i) => (
                  <StaggerItem
                    key={title}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg hover:shadow-slate-900/5"
                  >
                    <span className="pointer-events-none absolute top-3 right-4 text-4xl font-bold text-slate-100 transition group-hover:text-indigo-50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <CheckCircle2 className="size-5.5" />
                    </span>
                    <h3 className="relative mt-4 text-base font-semibold text-slate-900">{title}</h3>
                    <p className="relative mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>
          </section>

          {/* How the system works */}
          {project.journey && project.journey.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <Reveal className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  How This Website Works
                </h2>
                <p className="mt-3 text-base text-slate-500">
                  The complete flow, from a visitor&apos;s first click to a finished order.
                </p>
              </Reveal>

              <StaggerGrid className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
                {project.journey.map((step, i) => (
                  <StaggerItem key={step} className="relative text-center">
                    {i < project.journey!.length - 1 && (
                      <div className="absolute top-6 left-1/2 hidden h-px w-[calc(100%+2rem)] border-t border-dashed border-slate-300 lg:block" />
                    )}
                    <div className="relative z-10 mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-600/20">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900">{step}</h3>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </section>
          )}

          {/* Everything included */}
          <section className="bg-slate-50 py-16 md:py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <Reveal className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Everything Included
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Exactly what you get with the {solution.name.toLowerCase()} package — no surprises.
                </p>
              </Reveal>
              <StaggerGrid className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {solution.included.map((item) => {
                  const Icon = iconForIncluded(item);
                  return (
                    <StaggerItem
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition hover:border-indigo-100 hover:bg-indigo-50/40"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </StaggerItem>
                  );
                })}
              </StaggerGrid>
            </div>
          </section>

          {/* Get this package CTA */}
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-indigo-50/60 to-white p-8 sm:p-10">
              <div className="relative flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                    Want a website like this?
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                    {solution.name}{" "}
                    <span className="text-indigo-600">starting from {solution.price}</span>
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-500 sm:text-base">
                    {solution.included.slice(0, 3).join(" · ")} · Delivery in {solution.delivery}
                  </p>
                </div>
                <Link
                  href={`/solutions/${solution.slug}`}
                  className="inline-flex h-13 shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-7 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
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
        <section className="bg-slate-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                More Projects
              </h2>
              <p className="mt-2 text-sm text-slate-500">Other demo builds worth a look.</p>
            </Reveal>

            {otherProjects.length === 1 ? (
              <Reveal delay={0.1} className="mx-auto mt-10 max-w-4xl">
                <Link
                  href={`/work/${otherProjects[0].slug}`}
                  className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 sm:grid-cols-2"
                >
                  <div className="relative aspect-16/10 sm:aspect-auto sm:min-h-80">
                    <Image
                      src={otherProjects[0].image}
                      alt={otherProjects[0].name}
                      fill
                      className="object-cover object-top transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-7 sm:p-9">
                    <span className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                      {otherProjects[0].category}
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                      {otherProjects[0].name}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                      {otherProjects[0].description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
                      View Case Study
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ) : (
              <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherProjects.map((p) => (
                  <StaggerItem key={p.slug}>
                    <Link
                      href={`/work/${p.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
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
        className="relative overflow-hidden bg-linear-to-br from-[#3D2EF9] via-[#4732e8] to-[#061531] py-16 md:py-24"
      >
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-indigo-400/30 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-blue-500/20 blur-[100px]" />

        <Reveal className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur-sm">
            <ShieldCheck className="size-3.5" />
            আজই শুরু করুন
          </span>
          <h2 className="mt-5 text-2xl leading-tight font-bold tracking-tight text-white sm:text-4xl">
            আপনার ব্যবসার জন্য এমন একটি website তৈরি করুন
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
            আপনার business idea, budget এবং requirements অনুযায়ী আমরা তৈরি করি professional digital
            solutions।
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={CONTACT.whatsappHref}
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-500 px-6 text-sm font-semibold text-white shadow-md shadow-emerald-900/20 transition hover:bg-emerald-600"
            >
              <MessageCircle className="size-4" />
              WhatsApp / Messenger
            </Link>
            <Link
              href={CONTACT.phoneHref}
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
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
