"use client";

import { useGet } from "@/src/hooks/useGet";
import HeroSection from "../shared/HeroSection/HeroSection";
import SpecialtiesList from "./SpecialtiesList";
import { ISpecialtyListItem } from "./types";

export default function Specialties() {
  const { data, isLoading } = useGet<ISpecialtyListItem[]>(
    "/specialities/list",
    ["specialities-list"]
  );

  return (
    <div>
      <HeroSection
        image="/specialties/specialties_one.jpg"
        title="Specialties"
        description="Providing trusted healthcare services with advanced technology, experienced doctors, and compassionate care for you and your family"
      />

      <section className="py-10 lg:py-16 xl:py-20">
        <div className="container">
          <SpecialtiesList
            data={data?.data as ISpecialtyListItem[]}
            isLoading={isLoading}
          />
        </div>
      </section>
    </div>
  );
}
