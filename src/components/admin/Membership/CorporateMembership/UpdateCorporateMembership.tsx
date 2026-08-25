"use client";

import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";
import CreateUpdateCorporateMembership from "../Form/CreateUpdateCorporateMembership";
import CorporateMembershipFormSkeleton from "../Skeleton/CorporateMembershipFormSkeleton";
import { ICorporateMembership } from "../types";

export default function UpdateCorporateMembership() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useGet<ICorporateMembership>(
    `/corporate-membership/${id}`,
    ["corporate-membership", id]
  );

  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/corporate-membership"
          title="Update Corporate Membership"
          desc="Edit corporate membership information"
        />
      </div>

      {isLoading ? (
        <CorporateMembershipFormSkeleton />
      ) : (
        <CreateUpdateCorporateMembership
          initialValues={data?.data || undefined}
        />
      )}
    </div>
  );
}
