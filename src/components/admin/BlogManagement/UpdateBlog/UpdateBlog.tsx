"use client";
import { IBlog } from "@/src/components/blogs/types";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";
import CreateUpdateBlog from "../Form/CreateUpdateBlog";
import BlogFormSkeleton from "../Skeleton/PackageFormSkeleton";

export default function UpdateBlog() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useGet<IBlog>(`/blog/${id}`, ["blogs", id]);

  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/blogs"
          title="Blog Details"
          desc="View blog information"
        />
      </div>
      {isLoading ? (
        <BlogFormSkeleton />
      ) : (
        <CreateUpdateBlog initialValues={data?.data} />
      )}
    </div>
  );
}
