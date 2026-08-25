"use client";

import Text from "../../shared/Text";
import { ISpecialtySection } from "../types";
import SpecialtyHtml from "./SpecialtyHtml";

export default function SpecialtyEightSection({
  section,
}: {
  section?: ISpecialtySection;
}) {
  if (!section) return null;

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
    </section>
  );
}
