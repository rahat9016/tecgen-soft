"use client";

import { useGet } from "@/src/hooks/useGet";
import { normalizeImageSrc } from "@/src/utils/normalizeImageSrc";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import BookAppointmentSection from "../../shared/BookAppointmentSection";
import DynamicBreadcrumb from "../../shared/DynamicBreadcrumb";
import HeroSection from "../../shared/HeroSection/HeroSection";
import NotFoundData from "../../shared/NotFoundData";
import SpecialtyDetailSkeleton from "../Skeleton/SpecialtyDetailSkeleton";
import { ISpecialtyDetail } from "../types";
import HealthPackageSection from "./HealthPackageSection";
import SpecialtyDoctorSections from "./SpecialtyDoctorSections";
import SpecialtyEightSection from "./SpecialtyEightSection";
import SpecialtyFifthSection from "./SpecialtyFifthSection";
import SpecialtyFirstSection from "./SpecialtyFirstSection";
import SpecialtyFourthSection from "./SpecialtyFourthSection";
import SpecialtySecondSection from "./SpecialtySecondSection";
import SpecialtySeventhSection from "./SpecialtySeventhSection";
import SpecialtySixthSection from "./SpecialtySixthSection";
import SpecialtyThirdSection from "./SpecialtyThirdSection";

export default function SpecialtyDetailView() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useGet<ISpecialtyDetail>(
    `/specialities/${slug}`,
    ["speciality-details", slug],
    undefined,
    { enabled: !!slug }
  );

  const specialty = data?.data;

  const orderedSections = useMemo(
    () =>
      [...(specialty?.sections || [])]
        .filter((section) => section.status === "ACTIVE")
        .sort((first, second) => first.order - second.order)
        .map((section) => ({
          ...section,
          sectionItems: section.sectionItems.filter(
            (item) => item.status === "ACTIVE"
          ),
        })),
    [specialty?.sections]
  );

  const orderedDoctorSections = useMemo(
    () =>
      [...(specialty?.doctorSections || [])]
        .filter((doctorSection) => doctorSection.status === "ACTIVE")
        .sort((first, second) => first.order - second.order),
    [specialty?.doctorSections]
  );

  const firstSection = orderedSections.find(
    (section) => section.order === 1 && section.type === "TEXT"
  );

  const secondSection = orderedSections.find(
    (section) => section.order === 2 && section.type === "TEXT_WITH_IMAGE"
  );

  const thirdSection = orderedSections.find(
    (section) => section.order === 3 && section.type === "LIST"
  );

  const fourthSection = orderedSections.find(
    (section) => section.order === 4 && section.type === "LIST"
  );

  const fifthSection = orderedSections.find(
    (section) => section.order === 5 && section.type === "TEXT"
  );

  const sixthSection = orderedSections.find(
    (section) => section.order === 6 && section.type === "LIST"
  );

  const seventhSection = orderedSections.find(
    (section) => section.order === 7 && section.type === "TEXT_WITH_LIST"
  );
  const eightSection = orderedSections.find(
    (section) => section.order === 8 && section.type === "TEXT"
  );

  if (isLoading) {
    return <SpecialtyDetailSkeleton />;
  }

  if (!specialty) {
    return (
      <div className="container py-10">
        <NotFoundData />
      </div>
    );
  }

  return (
    <div>
      <HeroSection
        image={normalizeImageSrc(specialty.cover_image)}
        title={specialty.title}
        description={specialty.description}
      />
      <div className="container py-4">
        <DynamicBreadcrumb />
      </div>
      <SpecialtyFirstSection section={firstSection} />
      <SpecialtyDoctorSections sections={orderedDoctorSections} />
      <SpecialtySecondSection section={secondSection} />
      <SpecialtyThirdSection section={thirdSection} />
      <SpecialtyFourthSection section={fourthSection} />
      <SpecialtyFifthSection section={fifthSection} />
      <SpecialtySixthSection section={sixthSection} />
      <HealthPackageSection />
      <SpecialtySeventhSection section={seventhSection} />
      <SpecialtyEightSection section={eightSection} />
      <BookAppointmentSection />
    </div>
  );
}
