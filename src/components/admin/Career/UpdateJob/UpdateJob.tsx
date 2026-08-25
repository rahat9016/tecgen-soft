"use client";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";
import CreateUpdateCareer from "../Form/CreateUpdateCareer";
import BlogFormSkeleton from "../Skeleton/CareerFormSkeleton";
import { ICareer } from "../types";

export default function UpdateJob() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useGet<ICareer>(`/career/${id}`, ["careers", id]);

  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/job-list"
          title="Job Details"
          desc="View job information"
        />
      </div>
      {isLoading ? (
        <BlogFormSkeleton />
      ) : (
        <CreateUpdateCareer initialValues={data?.data as ICareer | undefined} />
      )}
    </div>
  );
}
