import DoctorFormSkeleton from "@/src/components/admin/Doctors/Doctors/AddUpdateDoctor/Skeleton/DoctorFormSkeleton";
import CreateUpdateSpecialty from "@/src/components/admin/Specialties/Specialties/AddUpdateSpecialty/Form/CreateUpdateSpecialty";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<DoctorFormSkeleton />}>
      <CreateUpdateSpecialty />
    </Suspense>
  );
}
