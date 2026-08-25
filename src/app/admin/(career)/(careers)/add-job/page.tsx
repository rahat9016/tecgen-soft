import CreateUpdateCareer from "@/src/components/admin/Career/Form/CreateUpdateCareer";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";

export default function page() {
  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/job-list"
          title="Add new Job"
          desc="Add job information"
        />
      </div>
      <CreateUpdateCareer />
    </div>
  );
}
