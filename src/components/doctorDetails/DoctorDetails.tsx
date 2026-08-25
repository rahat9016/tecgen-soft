"use client";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";
import { IDoctor } from "../admin/Doctors/types";
import DoctorContent from "./DoctorContent";
import DoctorDetailsSkeleton from "./DoctorDetailsSkeleton";

export default function DoctorDetails() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useGet<IDoctor>(`/doctor/${id}`, ["doctors", id]);
  return (
    <div>
      {isLoading ? (
        <DoctorDetailsSkeleton />
      ) : (
        <DoctorContent doctor={data?.data as IDoctor} />
      )}
    </div>
  );
}
