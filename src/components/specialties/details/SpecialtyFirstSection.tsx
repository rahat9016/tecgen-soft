"use client";

import Text from "../../shared/Text";
import { ISpecialtySection } from "../types";

export default function SpecialtyFirstSection({
  section,
}: {
  section?: ISpecialtySection;
}) {
  if (!section) return null;

  return (
    <section className="container pb-8 lg:pb-14">
      <Text
        as="h2"
        className="mb-6 text-xl lg:text-3xl xl:text-[44px] font-semibold text-secondary-dark"
      >
        {section.title}
      </Text>

      {section.description ? (
        <div dangerouslySetInnerHTML={{ __html: section.description }} />
      ) : null}
    </section>
  );
}
