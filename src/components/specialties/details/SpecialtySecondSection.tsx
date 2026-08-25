"use client";

import { normalizeImageSrc } from "@/src/utils/normalizeImageSrc";
import Image from "next/image";
import Text from "../../shared/Text";
import { ISpecialtySection } from "../types";

export default function SpecialtySecondSection({
  section,
}: {
  section?: ISpecialtySection;
}) {
  if (!section) return null;

  const sortedImages = [...(section.sectionImages || [])].sort(
    (first, second) => first.position - second.position
  );

  const image_zero =
    sortedImages.find((image) => image.position === 0) || sortedImages[0];
  const image_one = sortedImages.find((image) => image.position === 1);
  const image_two = sortedImages.find((image) => image.position === 2);
  const image_three = sortedImages.find((image) => image.position === 3);

  return (
    <section className="container pb-8 lg:pb-15">
      <Text
        as="h2"
        className="mb-6 text-xl lg:text-3xl xl:text-[44px] font-semibold text-secondary-dark"
      >
        {section.title}
      </Text>

      {image_zero ? (
        <div className="relative w-full h-72 md:h-96 lg:h-120 rounded-xl overflow-hidden mb-6">
          <Image
            src={normalizeImageSrc(image_zero.imageUrl)}
            alt={`${section.title} image 0`}
            fill
            className="object-cover"
          />
        </div>
      ) : null}

      {section.description ? (
        <div
          className="mb-6"
          dangerouslySetInnerHTML={{ __html: section.description }}
        />
      ) : null}

      <div>
        {image_one || image_two || image_three ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {image_one ? (
              <div className="relative w-full h-72 rounded-xl overflow-hidden lg:w-92.25 lg:h-115 lg:shrink-0">
                <Image
                  src={normalizeImageSrc(image_one.imageUrl)}
                  alt={`${section.title} image 1`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            {image_two ? (
              <div className="relative w-full h-80 rounded-xl overflow-hidden lg:flex-1 lg:h-126.75">
                <Image
                  src={normalizeImageSrc(image_two.imageUrl)}
                  alt={`${section.title} image 2`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            {image_three ? (
              <div className="relative w-full h-72 rounded-xl overflow-hidden lg:w-92.25 lg:h-115 lg:shrink-0">
                <Image
                  src={normalizeImageSrc(image_three.imageUrl)}
                  alt={`${section.title} image 3`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
