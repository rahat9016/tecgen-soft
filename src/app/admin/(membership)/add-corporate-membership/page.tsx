import CreateUpdateCorporateMembership from "@/src/components/admin/Membership/Form/CreateUpdateCorporateMembership";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";

export default function page() {
  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/corporate-membership"
          title="Add New Corporate Membership"
          desc="Add corporate membership information"
        />
      </div>
      <CreateUpdateCorporateMembership />
    </div>
  );
}
