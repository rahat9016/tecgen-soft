"use client";

import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  mediaImageSchema,
  MediaImageSchemaForm,
} from "../Schema/mediaImageSchema";
import { IMediaImage } from "../types";
import MediaImageForm from "./MediaImageForm";

export default function CreateUpdateMediaImage({
  initialValues,
}: {
  initialValues?: IMediaImage;
}) {
  const router = useRouter();
  const { mutateAsync, error, isPending } = usePost(
    "/image-gallery",
    () => {
      toast.success("Image created successfully!");
      router.push("/admin/image-gallery");
    },
    [["image-gallery"]]
  );

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("Image updated successfully!");
    router.push("/admin/image-gallery");
  }, [["image-gallery"]]);

  const methods = useForm({
    resolver: yupResolver(mediaImageSchema) as Resolver<MediaImageSchemaForm>,
    values: initialValues
      ? {
          ...initialValues,
          image: initialValues.imageUrl,
          status: initialValues.status,
        }
      : undefined,
  });

  const onSubmit = (data: MediaImageSchemaForm) => {
    const formData = new FormData();
    formData.append("status", data.status);

    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else if (typeof data.image === "string") {
      formData.append("image", data.image);
    }

    if (initialValues) {
      patchMutateAsync({
        url: `/image-gallery/${initialValues.id}`,
        data: formData,
      }).catch((err) => {
        toast.error(err?.message || "Failed to update image");
      });
    } else {
      mutateAsync(formData).catch((err) => {
        toast.error(err?.message || "Failed to create image");
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <MediaImageForm
        isEditMode={!!initialValues}
        onSubmit={onSubmit}
        error={initialValues ? patchError : error}
        isPending={initialValues ? patchIsPending : isPending}
      />
    </FormProvider>
  );
}
