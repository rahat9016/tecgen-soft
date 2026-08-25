"use client";

import Text from "../../shared/Text";
import { ISpecialtySection } from "../types";

export default function SpecialtyFourthSection({
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
        className="mb-6 lg:mb-10 text-xl lg:text-3xl xl:text-[44px] font-semibold text-secondary-dark"
      >
        {section.title}
      </Text>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-light-silver p-5 transition-colors duration-200 hover:bg-primary group"
          >
            <Text
              as="h3"
              className="mb-2 text-base lg:text-lg xl:text-lg text-secondary-dark group-hover:text-white"
            >
              {item.title}
            </Text>

            {item.description ? (
              <p className="text-secondary-foreground text-base font-regular group-hover:text-white">
                {item.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
