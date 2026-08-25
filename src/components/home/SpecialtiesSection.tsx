"use client";
import SpecialtiesImg from "@/public/specialties/specialties.jpg";
import { useGet } from "@/src/hooks/useGet";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ISpecialty } from "../admin/Specialties/types";
import Text from "../shared/Text";
import SpecialtiesCard from "../specialties/SpecialtiesCard";
import { Button } from "../ui/button";
import SpecialtiesCardSkeleton from "./skeleton/SpecialtiesCardSkeleton";

export default function SpecialtiesSection() {
  const router = useRouter();
  const { data, isLoading } = useGet<ISpecialty[]>(
    "/specialities",
    ["specialities"],
    {
      page: "1",
      limit: "4",
    }
  );

  return (
    <div className="py-10 xl:py-18">
      <div className="container">
        <Text className="mb-6 xl:mb-10">Specialties</Text>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xl:gap-6">
          <div>
            <Image
              src={SpecialtiesImg}
              alt="Specialties"
              width={2664}
              height={1464}
            />
          </div>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:gap-5">
              {isLoading ? (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SpecialtiesCardSkeleton key={i} />
                  ))}
                </>
              ) : (
                data?.data?.map((specialty) => (
                  <SpecialtiesCard
                    key={specialty.id}
                    title={specialty.title}
                    description={specialty.description}
                    id={String(specialty.id)}
                  />
                ))
              )}
            </div>
            <Button
              onClick={() => router.push("/specialties")}
              className="w-full h-11 mt-4 xl:mt-7 py-4 cursor-pointer font-medium text-sm lg:text-base flex items-center"
            >
              See All Specialties{" "}
              <Image
                src="/icons/right_arrow_white.svg"
                alt="Arrow right"
                width={20}
                height={20}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
