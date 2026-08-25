"use client";

import { cn } from "@/src/lib/utils";
import { normalizeImageSrc } from "@/src/utils/normalizeImageSrc";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import Text from "../../shared/Text";
import {
  ISpecialtySection,
  ISpecialtySectionImage,
  ISpecialtySectionItem,
} from "../types";

const SpecialtyHtml = ({
  html,
  className,
}: {
  html?: string | null;
  className?: string;
}) => {
  if (!html) return null;

  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none prose-p:text-secondary-foreground prose-li:text-secondary-foreground prose-span:text-secondary-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Text
    as="h2"
    className="mb-4 text-xl md:text-2xl lg:text-3xl xl:text-[32px] text-secondary-dark"
  >
    {title}
  </Text>
);

const SectionItemsGrid = ({ items }: { items: ISpecialtySectionItem[] }) => {
  const activeItems = items.filter((item) => item.status === "ACTIVE");

  if (!activeItems.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeItems.map((item) => (
        <div
          key={item.id}
          className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
        >
          <h3 className="text-secondary-dark font-semibold text-sm md:text-base mb-2 leading-snug">
            {item.title}
          </h3>
          <SpecialtyHtml html={item.description} className="prose-p:m-0" />
        </div>
      ))}
    </div>
  );
};

const SectionTextWithList = ({ section }: { section: ISpecialtySection }) => (
  <>
    <SpecialtyHtml html={section.description} />
    <div className={section.description ? "mt-6" : ""}>
      <SectionItemsGrid items={section.sectionItems} />
    </div>
  </>
);

const sortedImages = (images: ISpecialtySectionImage[]) =>
  [...(images || [])].sort((first, second) => first.position - second.position);

const SectionTextWithImage = ({ section }: { section: ISpecialtySection }) => {
  const images = sortedImages(section.sectionImages);
  const heroImage = images.find((image) => image.position === 0) || images[0];
  const galleryImages = images
    .filter((image) => image.id !== heroImage?.id)
    .slice(0, 3);

  return (
    <>
      {heroImage ? (
        <div className="relative w-full h-72 md:h-96 lg:h-120 rounded-xl overflow-hidden mb-6">
          <Image
            src={normalizeImageSrc(heroImage.imageUrl)}
            alt={`${section.title} cover`}
            fill
            className="object-cover"
          />
        </div>
      ) : null}

      <SpecialtyHtml html={section.description} />

      {galleryImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden"
            >
              <Image
                src={normalizeImageSrc(image.imageUrl)}
                alt={`${section.title} image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
};

const SectionAccordion = ({ section }: { section: ISpecialtySection }) => {
  const activeItems = section.sectionItems.filter(
    (item) => item.status === "ACTIVE"
  );

  if (!activeItems.length) return null;

  return (
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
              <SpecialtyHtml html={item.description} className="prose-p:m-0" />
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
};

const SectionImageOnly = ({ section }: { section: ISpecialtySection }) => {
  const images = sortedImages(section.sectionImages);

  if (!images.length) return null;

  const firstImage = images[0];
  const restImages = images.slice(1);

  return (
    <>
      <div className="relative w-full h-72 md:h-96 lg:h-120 rounded-xl overflow-hidden mb-6">
        <Image
          src={normalizeImageSrc(firstImage.imageUrl)}
          alt={`${section.title} cover`}
          fill
          className="object-cover"
        />
      </div>

      {restImages.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {restImages.map((image, index) => (
            <div
              key={image.id}
              className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden"
            >
              <Image
                src={normalizeImageSrc(image.imageUrl)}
                alt={`${section.title} image ${index + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
};

const SectionBodyByType = ({ section }: { section: ISpecialtySection }) => {
  switch (section.type) {
    case "TEXT":
      return <SpecialtyHtml html={section.description} />;
    case "TEXT_WITH_IMAGE":
      return <SectionTextWithImage section={section} />;
    case "TEXT_WITH_LIST":
      return <SectionTextWithList section={section} />;
    case "IMAGE":
      return <SectionImageOnly section={section} />;
    case "LIST":
      return section.order === 6 ? (
        <SectionAccordion section={section} />
      ) : (
        <SectionItemsGrid items={section.sectionItems} />
      );
    default:
      return null;
  }
};

export const SpecialtySectionByOrder = ({
  section,
}: {
  section?: ISpecialtySection;
}) => {
  if (!section || section.status !== "ACTIVE") return null;

  return (
    <section className="container pb-14">
      <SectionTitle title={section.title} />

      <SectionBodyByType section={section} />
    </section>
  );
};

export const SpecialtySections = ({
  sections,
}: {
  sections: ISpecialtySection[];
}) => {
  if (!sections?.length) return null;

  return (
    <>
      {sections.map((section) => (
        <SpecialtySectionByOrder key={section.id} section={section} />
      ))}
    </>
  );
};
