"use client";

import { reportURL } from "@/src/config/envConfig";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { navLinks } from "./navLinks";
import { Specialty } from "./types";

export default function MobileNav({
  specialty,
}: {
  specialty: Specialty[] | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [specialtiesOpen, setSpecialtiesOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)}>
        <Menu size={28} />
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-screen w-72 bg-background transform transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <span className="font-semibold text-lg text-secondary-foreground">
            Menu
          </span>
          <button onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {navLinks.map(({ label, href, hasChildren }) => {
            if (hasChildren) {
              return (
                <div key={label}>
                  <button
                    onClick={() => setSpecialtiesOpen((p) => !p)}
                    className="flex items-center justify-between w-full font-medium text-secondary-foreground hover:text-primary"
                  >
                    {label}
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        specialtiesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {specialtiesOpen && (
                    <div className="mt-2 pl-3 flex flex-col gap-3">
                      {specialty?.map((item) => (
                        <Link
                          key={item.id}
                          href={`/specialties/${item.id}`}
                          onClick={() => setOpen(false)}
                          className="text-sm text-secondary-foreground hover:text-primary"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="font-medium text-secondary-foreground"
              >
                {label}
              </Link>
            );
          })}

          {/* CTA */}
          <Link
            href={reportURL}
            className="mt-4 bg-primary text-white text-center rounded-md py-3 font-medium shrink-0"
            target="_blank"
          >
            Online Report
          </Link>
        </nav>
      </div>
    </div>
  );
}
