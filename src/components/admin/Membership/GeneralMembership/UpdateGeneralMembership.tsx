"use client";

import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";
import CreateUpdateGeneralMembership from "../Form/CreateUpdateGeneralMembership";
import GeneralMembershipFormSkeleton from "../Skeleton/GeneralMembershipFormSkeleton";
import { IGeneralMembership } from "../types";

export default function UpdateGeneralMembership() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useGet<IGeneralMembership>(
    `/general-membership/${id}`,
    ["general-membership", id]
  );

  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/general-membership"
          title="Update General Membership"
          desc="Edit general membership information"
        />
      </div>

      {isLoading ? (
        <GeneralMembershipFormSkeleton />
      ) : (
        <CreateUpdateGeneralMembership
          initialValues={data?.data || undefined}
        />
      )}
    </div>
  );
}
