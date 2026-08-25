import CreateUpdateGeneralMembership from "@/src/components/admin/Membership/Form/CreateUpdateGeneralMembership";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";

export default function page() {
  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/general-membership"
          title="Add New General Membership"
          desc="Add general membership information"
        />
      </div>
      <CreateUpdateGeneralMembership />
    </div>
  );
}
