"use client";

import { ISpecialtyDoctorSection } from "../types";
import SpecialtyDoctorsSection from "./SpecialtyDoctorsSection";

export default function SpecialtyDoctorSections({
  sections,
}: {
  sections: ISpecialtyDoctorSection[];
}) {
  if (!sections?.length) return null;

  return (
    <>
      {sections.map((section) => (
        <SpecialtyDoctorsSection key={section.id} section={section} />
      ))}
    </>
  );
}
