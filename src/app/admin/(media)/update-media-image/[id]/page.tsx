"use client";
import BlogFormSkeleton from "@/src/components/admin/Career/Skeleton/CareerFormSkeleton";
import CreateUpdateMediaImage from "@/src/components/admin/Media/Form/CreateUpdateMediaImage";
import { IMediaImage } from "@/src/components/admin/Media/types";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";

export default function UpdateMediaImage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useGet<IMediaImage>(`/image-gallery/${id}`, [
    "image-gallery",
    id,
  ]);

  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/image-gallery"
          title="Update Image"
          desc="Update image information"
        />
      </div>
      {isLoading ? (
        <BlogFormSkeleton />
      ) : (
        <CreateUpdateMediaImage initialValues={data?.data} />
      )}
    </div>
  );
}
