"use client";
import AdminBackButton from "@/src/components/shared/AdminBackButton/AdminBackButton";
import CreateUpdateMediaImage from "@/src/components/admin/Media/Form/CreateUpdateMediaImage";

export default function AddMediaImage() {
  return (
    <div>
      <div className="mb-6">
        <AdminBackButton
          routeURL="/admin/image-gallery"
          title="Add New Image"
          desc="Add a new image to the gallery"
        />
      </div>
      <CreateUpdateMediaImage />
    </div>
  );
}
