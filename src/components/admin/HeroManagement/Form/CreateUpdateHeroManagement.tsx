"use client";

import { usePost } from "@/src/hooks/usePost";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { useEffect } from "react";
import {
  heroManagementSchema,
  HeroManagementSchemaForm,
} from "../Schema/heroManagementSchema";
import { IHeroManagement } from "../types";
import HeroManagementForm from "./HeroManagementForm";

export default function CreateUpdateHeroManagement({
  initialValues,
}: {
  initialValues?: IHeroManagement;
}) {
  const { mutateAsync, error, isPending } = usePost(
    "/hero-management",
    () => {
      toast.success(
        initialValues
          ? "Hero section updated successfully!"
          : "Hero section created successfully!"
      );
    },
    [["hero-management"]]
  );

  const methods = useForm({
    resolver: yupResolver(heroManagementSchema),
    defaultValues: {
      images: [],
    },
  });

  useEffect(() => {
    if (initialValues) {
      methods.reset({
        title: initialValues.title || "",
        description: initialValues.description || "",
        images: initialValues.images || [],
      });
    }
  }, [initialValues, methods]);

  const onSubmit = async (data: HeroManagementSchemaForm) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);

    data.images.forEach((image) => {
      if (image instanceof File) {
        formData.append("images", image);
      }
    });

    const existingImages = (initialValues?.images || []).filter(
      (image): image is string => typeof image === "string"
    );
    const currentStringImages = data.images.filter(
      (image): image is string => typeof image === "string"
    );

    const deletedImages = existingImages.filter(
      (image) => !currentStringImages.includes(image)
    );

    deletedImages.forEach((imageUrl) => {
      formData.append("deleteImages[]", imageUrl);
    });

    try {
      await mutateAsync(formData);
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message || "Failed to save hero section"
      );
      return;
    }

    if (!initialValues) {
      methods.reset({
        title: "",
        description: "",
        images: [],
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <HeroManagementForm
        isEditMode={!!initialValues}
        onSubmit={onSubmit}
        error={error}
        isPending={isPending}
      />
    </FormProvider>
  );
}
