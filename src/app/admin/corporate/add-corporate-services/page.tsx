import CreateUpdateCorporateService from "@/src/components/admin/Corporate/Form/CreateUpdateCorporateService";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";

export default function page() {
  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/corporate"
          title="Add new Company"
          desc="Add Company information"
        />
      </div>
      <CreateUpdateCorporateService />
    </div>
  );
}
