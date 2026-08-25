import CreateUpdateBlog from "@/src/components/admin/BlogManagement/Form/CreateUpdateBlog";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";

export default function page() {
  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/blogs"
          title="Add new Blog"
          desc="Add blog information"
        />
      </div>
      <CreateUpdateBlog />
    </div>
  );
}
