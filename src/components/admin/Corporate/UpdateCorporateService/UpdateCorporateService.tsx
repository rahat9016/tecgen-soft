"use client";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";
import CreateUpdateCorporateService from "../Form/CreateUpdateCorporateService";
import BlogFormSkeleton from "../Skeleton/CorporateFormSkeleton";
import { ICorporate } from "../types";

export default function UpdateCorporateService() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useGet<ICorporate>(`/corporate-service/${id}`, [
    "corporate-service",
    id,
  ]);

  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/corporate"
          title="Company Details"
          desc="View Company information"
        />
      </div>
      {isLoading ? (
        <BlogFormSkeleton />
      ) : (
        <CreateUpdateCorporateService initialValues={data?.data} />
      )}
    </div>
  );
}
