"use client";

import { cn } from "@/src/lib/utils";
import Text from "../../shared/Text";
import { ISpecialtySection } from "../types";

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

export default function SpecialtyFifthSection({
  section,
}: {
  section?: ISpecialtySection;
}) {
  if (!section) return null;

  return (
    <section className="container pb-8 lg:pb-15">
      <Text
        as="h2"
        className="mb-6 text-xl lg:text-3xl xl:text-[44px] font-semibold text-secondary-dark"
      >
        {section.title}
      </Text>

      {section.description ? (
        <SpecialtyHtml html={section.description} />
      ) : null}
    </section>
  );
}
