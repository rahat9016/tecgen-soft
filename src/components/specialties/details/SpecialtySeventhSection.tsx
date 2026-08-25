"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, X } from "lucide-react";
import Text from "../../shared/Text";
import { ISpecialtySection } from "../types";
import SpecialtyHtml from "./SpecialtyHtml";

export default function SpecialtySeventhSection({
  section,
}: {
  section?: ISpecialtySection;
}) {
  if (!section) return null;

  const activeItems = section.sectionItems.filter(
    (item) => item.status === "ACTIVE"
  );

  return (
    <section className="container pb-8 lg:pb-25">
      <Text
        as="h2"
        className="mb-6 text-xl lg:text-3xl xl:text-[44px] font-semibold text-secondary-dark"
      >
        {section.title}
      </Text>

      {section.description ? (
        <div className="mb-6">
          <SpecialtyHtml html={section.description} />
        </div>
      ) : null}

      {activeItems.length > 0 ? (
        <AccordionPrimitive.Root
          type="single"
          collapsible
          className="w-full space-y-3"
        >
          {activeItems.map((item) => (
            <AccordionPrimitive.Item
              key={item.id}
              value={`section-${section.id}-${item.id}`}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger className="group flex flex-1 items-center justify-between gap-4 px-5 py-5 text-left text-base font-medium transition-all duration-200 cursor-pointer outline-none text-secondary-dark data-[state=open]:bg-primary data-[state=open]:text-white data-[state=open]:rounded-t-lg">
                  {item.title}
                  <ChevronDown className="size-5 shrink-0 text-gray-400 group-data-[state=open]:hidden" />
                  <span className="shrink-0 size-8 rounded-full border-2 border-white/60 items-center justify-center hidden group-data-[state=open]:flex">
                    <X className="size-4" />
                  </span>
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm">
                <div className="px-5 py-5 bg-gray-50 text-secondary-foreground leading-relaxed">
                  <SpecialtyHtml
                    html={item.description}
                    className="prose-p:m-0"
                  />
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
      ) : null}
    </section>
  );
}
