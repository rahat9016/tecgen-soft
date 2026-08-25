"use client";

import DoctorCard from "../../doctor-appointment/DoctorCard";
import NotFoundData from "../../shared/NotFoundData";
import Text from "../../shared/Text";
import { ISpecialtyDoctorSection } from "../types";

export default function SpecialtyDoctorsSection({
  section,
}: {
  section?: ISpecialtyDoctorSection;
}) {
  if (!section || section.status !== "ACTIVE") return null;

  return (
    <section className="container pb-12 lg:pb-25">
      <Text
        as="h2"
        className="mb-10 text-xl md:text-2xl lg:text-3xl  xl:text-[42px] text-secondary-dark"
      >
        {section.title}
      </Text>

      {!section.doctor?.length ? <NotFoundData /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {section.doctor.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            {...{
              id: doctor.id,
              doctorId: doctor.doctorId,
              fullName: doctor.fullName,
              image: doctor.image,
              department: doctor?.department,
              designation: doctor.designation,
            }}
          />
        ))}
      </div>
    </section>
  );
}
