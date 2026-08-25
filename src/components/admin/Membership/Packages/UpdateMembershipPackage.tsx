"use client";

import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";
import CreateUpdateMembershipPackage from "../Form/CreateUpdateMembershipPackage";
import MembershipPackageFormSkeleton from "../Skeleton/MembershipPackageFormSkeleton";
import { IMembershipPackage } from "../types";

export default function UpdateMembershipPackage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useGet<IMembershipPackage>(`/package/${id}`, [
    "membership-package",
    id,
  ]);

  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/packages"
          title="Update Package"
          desc="Edit package information"
        />
      </div>

      {isLoading ? (
        <MembershipPackageFormSkeleton />
      ) : (
        <CreateUpdateMembershipPackage
          initialValues={data?.data || undefined}
        />
      )}
    </div>
  );
}
