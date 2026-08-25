"use client";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import CreateUpdateMediaVideo from "@/src/components/admin/Media/Form/CreateUpdateMediaVideo";

export default function AddMediaVideo() {
  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/video-gallery"
          title="Add New Video"
          desc="Add a new video to the gallery"
        />
      </div>
      <CreateUpdateMediaVideo />
    </div>
  );
}
