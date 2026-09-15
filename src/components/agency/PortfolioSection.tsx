import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Reveal from "@/src/components/agency/Reveal";
import { StaggerGrid, StaggerItem } from "@/src/components/agency/StaggerGrid";

// TODO: replace with real delivered projects (image, live URL, one-line result).
// status must stay honest: "Client Project" only for paid, delivered work —
// everything else is "Demo Project". Never relabel a demo as a client project.
const projects: {
  name: string;
  category: string;
  description: string;
  image: string;
  href: string;
  status: "Client Project" | "Demo Project";
}[] = [
  {
    name: "E-commerce Website",
    category: "E-commerce",
    description: "Fashion ও product business-এর জন্য অনলাইন শপ — product, cart, checkout, admin dashboard।",
    image: "/ecommerce.webp",
    href: "#",
    status: "Demo Project",
  },
  {
    name: "Hotel Booking Website",
    category: "Hotel Booking",
    description: "Room browsing, booking ও admin management সহ হোটেল/রিসোর্ট বুকিং সিস্টেম।",
    image: "/hotel-management.webp",
    href: "#",
    status: "Demo Project",
  },
];

export default function PortfolioSection() {
  return (
    <section id="work" className="bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            আপনার মতো ব্যবসার জন্য আমরা কী তৈরি করেছি
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Don&apos;t just take our word for it. See the products.
          </p>
        </Reveal>

        <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2">
          {projects.map((project, i) => (
            <StaggerItem
              key={i}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover object-top transition duration-300 group-hover:scale-105"
                />
                <span
                  className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm ${
                    project.status === "Client Project"
                      ? "bg-emerald-500 text-white"
                      : "bg-white/90 text-slate-600"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs font-medium text-indigo-600">{project.category}</p>
                <h3 className="mt-0.5 text-base font-semibold text-slate-900">{project.name}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{project.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={project.href}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Live Demo
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                  <Link
                    href="#solutions"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    View Details
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
