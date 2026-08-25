"use client";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";
import { IDepartment, IDoctor } from "../../../types";
import CreateUpdateDoctor from "../Form/CreateUpdateDoctor";
import DoctorFormSkeleton from "../Skeleton/DoctorFormSkeleton";

export default function AddUpdateDoctor() {
  const params = useParams();
  const id = params.id as string;
  const { data: departmentsData, isLoading: isDepartmentsLoading } = useGet<
    IDepartment[]
  >("/department/list", ["departments", "doctor-form"]);

  const { data: doctorData, isLoading } = useGet(`/doctor/doctor/${id}`, [
    "doctors",
    id,
  ]);

  return (
    <div>
      <div>
        <div className="mb-6">
          <AdminBackButton
            routeURL="/admin/doctors"
            title="Doctor Details"
            desc="View Doctor information"
          />
        </div>
        {isLoading || isDepartmentsLoading ? (
          <DoctorFormSkeleton />
        ) : (
          <CreateUpdateDoctor
            initialValues={doctorData?.data as IDoctor}
            departments={departmentsData?.data as IDepartment[]}
          />
        )}
      </div>
    </div>
  );
}
