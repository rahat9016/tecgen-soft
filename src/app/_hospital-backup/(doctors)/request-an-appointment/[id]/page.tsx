import DoctorDetails from "@/src/components/doctorDetails/DoctorDetails";
import DynamicBreadcrumb from "@/src/components/shared/DynamicBreadcrumb";

export default function page() {
  return (
    <div className="container mt-6">
      <div className="mb-10">
        <DynamicBreadcrumb />
      </div>
      <div>
        <DoctorDetails />
      </div>
    </div>
  );
}
