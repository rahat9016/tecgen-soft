import CreateUpdateMembershipPackage from "@/src/components/admin/Membership/Form/CreateUpdateMembershipPackage";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";

export default function page() {
  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/packages"
          title="Add New Package"
          desc="Add package information"
        />
      </div>
      <CreateUpdateMembershipPackage />
    </div>
  );
}
