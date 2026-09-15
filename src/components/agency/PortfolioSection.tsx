import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

// TODO: replace with real delivered projects (image, live URL, one-line result).
// Keep only projects you can link to a live site — an unverifiable project card
// hurts trust more than having fewer, real ones.
const projects: {
  name: string;
  category: string;
  image: string;
  href: string;
}[] = [
  {
    name: "Project Name",
    category: "E-commerce Website",
    image: "/ecommerce.webp",
    href: "#",
  },
  {
    name: "Project Name",
    category: "Hotel Booking Website",
    image: "/hotel-management.webp",
    href: "#",
  },
];

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            আমরা যা তৈরি করেছি
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Real Work, Real Clients — দাবি নয়, দেখুন সরাসরি।
          </p>
        </Reveal>

        <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2">
          {projects.map((project, i) => (
            <StaggerItem
              key={i}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
            >
              <Link href={project.href} className="block">
                <div className="relative aspect-16/10 w-full overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover object-top transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <p className="text-xs font-medium text-indigo-600">{project.category}</p>
                    <h3 className="mt-0.5 text-base font-semibold text-slate-900">{project.name}</h3>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
