"use client";

import { IBlog } from "@/src/components/blogs/types";
import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { StatusType } from "@/src/types/common/common";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { blogSchema, BlogSchemaSchemaForm } from "../Schema/blogSchema";
import BlogForm from "./BlogForm";

export default function CreateUpdateBlog({
  initialValues,
}: {
  initialValues?: IBlog;
}) {
  const router = useRouter();
  const { mutateAsync, error, isPending } = usePost(
    "/blog",
    () => {
      toast.success("Blog created successfully!");
      router.push("/admin/blogs");
    },
    [["blogs"]]
  );

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("Blog updated successfully!");
    router.push("/admin/blogs");
  }, [["blogs"]]);

  const methods = useForm({
    resolver: yupResolver(blogSchema),
    defaultValues: {
      image: initialValues?.image || "",
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      status: initialValues?.status || StatusType.ACTIVE,
    },
  });

  useEffect(() => {
    if (initialValues) {
      methods.reset({
        image: initialValues.image || "",
        title: initialValues.title || "",
        description: initialValues.description || "",
        status: initialValues.status || StatusType.ACTIVE,
      });
    }
  }, [initialValues, methods]);

  const onSubmit = (data: BlogSchemaSchemaForm) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("status", data.status);
    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else if (typeof data.image === "string") {
      formData.append("image", data.image);
    }

    if (initialValues) {
      patchMutateAsync({
        url: `/blog/${initialValues.id}`,
        data: formData,
      }).catch((err) => {
        toast.error(err?.message || "Failed to update blog");
      });
    } else {
      mutateAsync(formData).catch((err) => {
        toast.error(err?.message || "Failed to create blog");
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <BlogForm
        isEditMode={!!initialValues}
        onSubmit={onSubmit}
        error={initialValues ? patchError : error}
        isPending={initialValues ? patchIsPending : isPending}
        status={initialValues?.status || StatusType.ACTIVE}
      />
    </FormProvider>
  );
}
