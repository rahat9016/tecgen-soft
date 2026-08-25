"use client";

import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { ISpecialtyDetail } from "@/src/components/specialties/types";
import CreateUpdateSpecialty from "../Form/CreateUpdateSpecialty";
import { getDefaultValues } from "../Form/getDefaultValues";
import DoctorFormSkeleton from "../Skeleton/DoctorFormSkeleton";
import { ISectionItem, ISpecialtyFormType, StatusValue } from "../types";

const normalizeStatus = (status?: string): StatusValue =>
  status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

const mapSectionItems = (
  items: ISpecialtyDetail["sections"][number]["sectionItems"] = [],
  fallbackStatus: StatusValue = "ACTIVE"
): ISectionItem[] =>
  items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description || "",
    status: fallbackStatus,
  }));

export default function UpdateSpecialty() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      if (id) {
        queryClient.removeQueries({
          queryKey: ["speciality", id],
          exact: true,
        });
      }
    };
  }, [id, queryClient]);

  const { data, isLoading } = useGet<ISpecialtyDetail>(
    `/specialities/${id}`,
    ["speciality", id],
    undefined,
    {
      enabled: !!id,
      staleTime: 0,
      refetchOnMount: "always",
    }
  );

  const specialty = data?.data;
  const sectionByOrder = (
    order: number,
    type?: ISpecialtyDetail["sections"][number]["type"]
  ) =>
    (specialty?.sections || []).find(
      (section) =>
        section.order === order &&
        (type ? section.type === type : section.order === order)
    );

  const sectionOne = sectionByOrder(1, "TEXT");
  const sectionTwo = sectionByOrder(2, "TEXT_WITH_IMAGE");
  const sectionThree = sectionByOrder(3, "LIST");
  const sectionFour = sectionByOrder(4, "LIST");
  const sectionFive = sectionByOrder(5, "TEXT");
  const sectionSix = sectionByOrder(6, "LIST");
  const sectionSeven = sectionByOrder(7, "TEXT_WITH_LIST");
  const sectionEight = sectionByOrder(8, "TEXT");

  const sectionTwoImages = [...(sectionTwo?.sectionImages || [])].sort(
    (first, second) => first.position - second.position
  );

  const firstDoctorSection = [...(specialty?.doctorSections || [])].sort(
    (first, second) => first.order - second.order
  )[0];

  const initialValues: Partial<ISpecialtyFormType> | undefined = specialty
    ? (getDefaultValues({
        hero: {
          title: specialty.title || "",
          description: specialty.description || "",
          coverImage: specialty.cover_image || "",
          status: normalizeStatus(specialty.status),
        },
        doctorSection: {
          title: firstDoctorSection?.title || "",
          order: firstDoctorSection?.order || 1,
          isActive: normalizeStatus(firstDoctorSection?.status) === "ACTIVE",
          doctors: (firstDoctorSection?.doctor || []).map((doctor) => ({
            id: doctor.id,
            doctorId: doctor.doctorId,
            fullName: doctor.fullName,
            image: doctor.image,
            status: normalizeStatus(doctor.status),
            department: {
              id: doctor.id,
              name: doctor.department?.name || "",
            },
          })),
        },
        sections: {
          sectionOne: {
            title: sectionOne?.title || "",
            description: sectionOne?.description || "",
            order: sectionOne?.order || 1,
            isActive: normalizeStatus(sectionOne?.status) === "ACTIVE",
          },
          sectionTwo: {
            title: sectionTwo?.title || "",
            description: sectionTwo?.description || "",
            coverImage:
              sectionTwoImages.find((item) => item.position === 0)?.imageUrl ||
              null,
            images: sectionTwoImages.map((item) => ({
              imageUrl: item.imageUrl,
              position: item.position,
            })),
            order: sectionTwo?.order || 2,
            isActive: normalizeStatus(sectionTwo?.status) === "ACTIVE",
          },
          sectionThree: {
            title: sectionThree?.title || "",
            order: sectionThree?.order || 3,
            isActive: normalizeStatus(sectionThree?.status) === "ACTIVE",
            items: mapSectionItems(
              sectionThree?.sectionItems,
              normalizeStatus(sectionThree?.status)
            ),
          },
          sectionFour: {
            title: sectionFour?.title || "",
            order: sectionFour?.order || 4,
            isActive: normalizeStatus(sectionFour?.status) === "ACTIVE",
            items: mapSectionItems(
              sectionFour?.sectionItems,
              normalizeStatus(sectionFour?.status)
            ),
          },
          sectionFive: {
            title: sectionFive?.title || "",
            description: sectionFive?.description || "",
            order: sectionFive?.order || 5,
            isActive: normalizeStatus(sectionFive?.status) === "ACTIVE",
          },
          sectionSix: {
            title: sectionSix?.title || "",
            order: sectionSix?.order || 6,
            isActive: normalizeStatus(sectionSix?.status) === "ACTIVE",
            items: mapSectionItems(
              sectionSix?.sectionItems,
              normalizeStatus(sectionSix?.status)
            ),
          },
          sectionSeven: {
            title: sectionSeven?.title || "",
            description: sectionSeven?.description || "",
            order: sectionSeven?.order || 7,
            isActive: normalizeStatus(sectionSeven?.status) === "ACTIVE",
            items: mapSectionItems(
              sectionSeven?.sectionItems,
              normalizeStatus(sectionSeven?.status)
            ),
          },
          sectionEight: {
            title: sectionEight?.title || "",
            description: sectionEight?.description || "",
            order: sectionEight?.order || 8,
            isActive: normalizeStatus(sectionEight?.status) === "ACTIVE",
          },
        },
      }) as Partial<ISpecialtyFormType>)
    : undefined;

  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/specialties"
          title="Specialty Details"
          desc="View Specialty information"
        />
      </div>

      {isLoading ? (
        <DoctorFormSkeleton />
      ) : (
        <CreateUpdateSpecialty initialValues={initialValues} specialtyId={id} />
      )}
    </div>
  );
}
