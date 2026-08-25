"use client";

import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { StatusType } from "@/src/types/common/common";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  mediaVideoSchema,
  MediaVideoSchemaForm,
} from "../Schema/mediaVideoSchema";
import { IMediaVideo } from "../types";
import MediaVideoForm from "./MediaVideoForm";

export default function CreateUpdateMediaVideo({
  initialValues,
}: {
  initialValues?: IMediaVideo;
}) {
  const router = useRouter();
  const { mutateAsync, error, isPending } = usePost(
    "/video-media",
    () => {
      toast.success("Video created successfully!");
      router.push("/admin/video-gallery");
    },
    [["video-media"]]
  );

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("Video updated successfully!");
    router.push("/admin/video-gallery");
  }, [["video-media"]]);

  const methods = useForm({
    resolver: yupResolver(mediaVideoSchema) as Resolver<MediaVideoSchemaForm>,
    values: initialValues
      ? {
          ...initialValues,
          link: initialValues.link || initialValues.url,
          status: initialValues.status as StatusType,
          videoThumbnail:
            initialValues.videoThumbnail || initialValues.thumbnail || "",
        }
      : undefined,
  });

  const onSubmit = (data: MediaVideoSchemaForm) => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("url", data.link);
    formData.append("duration", data.duration);
    formData.append("status", data.status);
    formData.append("description", data.description);

    if (data.videoThumbnail instanceof File) {
      formData.append("thumbnail", data.videoThumbnail);
    } else if (typeof data.videoThumbnail === "string") {
      formData.append("thumbnail", data.videoThumbnail);
    }

    if (initialValues) {
      patchMutateAsync({
        url: `/video-media/${initialValues.id}`,
        data: formData,
      }).catch((err) => {
        toast.error(err?.message || "Failed to update video");
      });
    } else {
      mutateAsync(formData).catch((err) => {
        toast.error(err?.message || "Failed to create video");
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <MediaVideoForm
        isEditMode={!!initialValues}
        onSubmit={onSubmit}
        error={initialValues ? patchError : error}
        isPending={initialValues ? patchIsPending : isPending}
      />
    </FormProvider>
  );
}
