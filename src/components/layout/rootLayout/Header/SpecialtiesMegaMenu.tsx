"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "../../../ui/scroll-area";
import { Specialty } from "./types";

export default function SpecialtiesMegaMenu({
  specialty,
}: {
  specialty: Specialty[] | undefined;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSpecialties = (specialty?.length ?? 0) > 0;

  // click outside close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex items-center gap-1">
      <Link
        href="/specialties"
        className="font-medium text-sm 2xl:text-base text-secondary-foreground hover:text-primary transition"
      >
        Specialties
      </Link>
      {hasSpecialties && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="p-1 text-secondary-foreground hover:text-primary transition cursor-pointer bg-transparent! shadow-none!"
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}

      <AnimatePresence>
        {open && hasSpecialties && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Mega Menu */}
            <motion.div
              ref={containerRef}
              className="fixed left-1/2 top-40 -translate-x-1/2 z-50 container min-h-[70vh] rounded border bg-background shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <ScrollArea className="h-[70vh]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-10">
                  {specialty?.map((item) => (
                    <Link
                      key={item.id}
                      href={`/specialties/${item.id}`}
                      className="group relative px-2 text-sm 2xl:text-base flex items-center font-medium"
                      onClick={() => setOpen(false)}
                    >
                      <ChevronRight className="text-secondary-foreground group-hover:text-primary" />
                      <span className="relative z-10 text-secondary-foreground group-hover:text-primary">
                        {item.title}
                      </span>
                      <span className="absolute left-1/2 -bottom-1 h-0.75 bg-primary -translate-x-1/2 w-0 group-hover:w-full transition-all duration-300" />
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
