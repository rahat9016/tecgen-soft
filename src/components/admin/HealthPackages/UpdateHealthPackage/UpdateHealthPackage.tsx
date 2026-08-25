"use client";
import { IHealthCheckPackage } from "@/src/components/health-check/types";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";
import CreateUpdatePackage from "../Form/CreateUpdatePackage";
import PackageFormSkeleton from "../Skeleton/PackageFormSkeleton";

export default function UpdateHealthPackage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useGet<IHealthCheckPackage>(
    `/health-packages/${id}`,
    ["health-package", id]
  );
  const healthPackage = data?.data;
  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/health-packages"
          title="Doctor Details"
          desc="View Doctor information"
        />
      </div>
      {isLoading ? (
        <PackageFormSkeleton />
      ) : (
        <CreateUpdatePackage initialValues={healthPackage} />
      )}
    </div>
  );
}
