"use client";
import BlogFormSkeleton from "@/src/components/admin/Career/Skeleton/CareerFormSkeleton";
import CreateUpdateMediaVideo from "@/src/components/admin/Media/Form/CreateUpdateMediaVideo";
import { IMediaVideo } from "@/src/components/admin/Media/types";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import { useGet } from "@/src/hooks/useGet";
import { useParams } from "next/navigation";

export default function UpdateMediaVideo() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useGet<IMediaVideo>(`/video-media/${id}`, [
    "video-media",
    id,
  ]);
  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/video-gallery"
          title="Update Video"
          desc="Update video information"
        />
      </div>
      {isLoading ? (
        <BlogFormSkeleton />
      ) : (
        <CreateUpdateMediaVideo initialValues={data?.data} />
      )}
    </div>
  );
}
