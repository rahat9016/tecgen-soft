"use client";

import { usePatch } from "@/src/hooks/usePatch";
import { usePost } from "@/src/hooks/usePost";
import { StatusType } from "@/src/types/common/common";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  corporateSchema,
  CorporateSchemaForm,
} from "../Schema/corporateSchema";
import { ICorporate } from "../types";
import CorporateServiceForm from "./CorporateServiceForm";

export default function CreateUpdateCorporateService({
  initialValues,
}: {
  initialValues?: ICorporate;
}) {
  const router = useRouter();
  const { mutateAsync, error, isPending } = usePost(
    "/corporate-service",
    () => {
      toast.success("Corporate service created successfully!");
      router.push("/admin/corporate");
    },
    [["corporate-service"]]
  );

  const {
    mutateAsync: patchMutateAsync,
    error: patchError,
    isPending: patchIsPending,
  } = usePatch(() => {
    toast.success("Corporate service updated successfully!");
    router.push("/admin/corporate");
  }, [["corporate-service"]]);

  const methods = useForm({
    resolver: yupResolver(corporateSchema),
    defaultValues: {
      imageUrl: "",
      name: "",
      url: "",
      description: "",
      status: StatusType.ACTIVE,
    },
  });

  useEffect(() => {
    if (initialValues) {
      methods.reset({
        ...initialValues,
        imageUrl: initialValues.imageUrl,
        status: initialValues.status,
      });
    }
  }, [initialValues, methods]);

  const onSubmit = (data: CorporateSchemaForm) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("url", data.url);
    formData.append("description", data.description);
    formData.append("status", data.status);

    if (data.imageUrl instanceof File) {
      formData.append("image", data.imageUrl);
    } else if (typeof data.imageUrl === "string") {
      formData.append("image", data.imageUrl);
    }

    if (initialValues) {
      patchMutateAsync({
        url: `/corporate-service/${initialValues.id}`,
        data: formData,
      }).catch((err) => {
        toast.error(err?.message || "Failed to update corporate service");
      });
    } else {
      mutateAsync(formData).catch((err) => {
        toast.error(err?.message || "Failed to create corporate service");
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <CorporateServiceForm
        isEditMode={!!initialValues}
        onSubmit={onSubmit}
        error={initialValues ? patchError : error}
        isPending={initialValues ? patchIsPending : isPending}
        status={initialValues?.status || StatusType.ACTIVE}
      />
    </FormProvider>
  );
}
