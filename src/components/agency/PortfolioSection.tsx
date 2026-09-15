import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import BrowserFrame from "@/src/components/agency/BrowserFrame";
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
    <section id="work" className="bg-slate-50 py-14 md:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            শুধু কথা নয় — <span className="text-indigo-600">আসল প্রোডাক্ট</span> দেখুন।
          </h2>
          <p className="mt-3 text-base text-slate-500">
            Every project below is real and clickable — not a mockup.
          </p>
        </Reveal>

        <StaggerGrid className="mt-12 flex flex-col gap-8">
          {projects.map((project, i) => (
            <StaggerItem
              key={i}
              className={`group grid items-center gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:shadow-slate-900/10 lg:grid-cols-5 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="flex items-center justify-center bg-linear-to-br from-indigo-50 via-slate-50 to-indigo-50 p-6 sm:p-10 lg:col-span-3 lg:h-full lg:min-h-96">
                <BrowserFrame
                  title={`${project.name.toLowerCase().replace(/\s+/g, "-")}.demo`}
                  src={project.image}
                  className="w-full shadow-2xl shadow-slate-900/15 transition duration-500 group-hover:-translate-y-1.5"
                  imageClassName="[&_img]:transition [&_img]:duration-500 group-hover:[&_img]:scale-105"
                  badge={
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        project.status === "Client Project"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {project.status}
                    </span>
                  }
                />
              </div>
              <div className="p-8 lg:col-span-2 lg:p-10">
                <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                  {project.category}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{project.name}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-500">{project.description}</p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Link
                    href={project.href}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    View Case Study
                    <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <Link
                    href="#solutions"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Similar Package
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
